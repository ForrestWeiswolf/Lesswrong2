/* global Random */
import { Utils, addCallback } from 'meteor/vulcan:core';
import { convertFromRaw } from 'draft-js';
import { draftToHTML } from '../draftConvert';
import Revisions from '../../lib/collections/revisions/collection'
import { extractVersionsFromSemver } from '../../lib/editor/utils'
import { ensureIndex } from '../../lib/collectionUtils'
import { htmlToPingbacks } from '../pingbacks.js';
import TurndownService from 'turndown';
const turndownService = new TurndownService()
turndownService.remove('style') // Make sure we don't add the content of style tags to the markdown

import markdownIt from 'markdown-it'
import markdownItMathjax from './markdown-mathjax.js'
import cheerio from 'cheerio';
import markdownItContainer from 'markdown-it-container'
import markdownItFootnote from 'markdown-it-footnote'

const mdi = markdownIt({linkify: true})
mdi.use(markdownItMathjax())
mdi.use(markdownItContainer, 'spoiler')
mdi.use(markdownItFootnote)

import { mjpage }  from 'mathjax-node-page'



function mjPagePromise(html, beforeSerializationCallback) {
  // Takes in HTML and replaces LaTeX with CommonHTML snippets
  // https://github.com/pkra/mathjax-node-page
  return new Promise((resolve, reject) => {
    mjpage(html, {}, {html: true, css: true}, resolve)
      .on('beforeSerialization', beforeSerializationCallback);
  })
}

// Adapted from: https://github.com/cheeriojs/cheerio/issues/748
const cheerioWrapAll = (toWrap, wrapper, $) => {
  if (toWrap.length < 1) {
    return toWrap;
  } 

  if (toWrap.length < 2 && $.wrap) { // wrap not defined in npm version,
    return $.wrap(wrapper);      // and git version fails testing.
  }

  const section = $(wrapper);
  let  marker = $('<div>');
  marker = marker.insertBefore(toWrap.first()); // in jQuery marker would remain current
  toWrap.each(function(k, v) {                  // in Cheerio, we update with the output.
    $(v).remove();
    section.append($(v));
  });
  section.insertBefore(marker); 
  marker.remove();
  return section;                 // This is what jQuery would return, IIRC.
}

const spoilerClass = 'spoiler-v2' // this is the second iteration of a spoiler-tag that we've implemented. Changing the name for backwards-and-forwards compatibility

/// Given HTML which possibly contains elements tagged with with a spoiler class
/// (ie, hidden until mouseover), parse the HTML, and wrap consecutive elements
/// that all have a spoiler tag in a shared spoiler element (so that the
/// mouse-hover will reveal all of them together).
function wrapSpoilerTags(html) {
  const $ = cheerio.load(html)
  
  // Iterate through spoiler elements, collecting them into groups. We do this
  // the hard way, because cheerio's sibling-selectors don't seem to work right.
  let spoilerBlockGroups = [];
  let currentBlockGroup = [];
  $(`.${spoilerClass}`).each(function() {
    const element = this;
    if (!(element?.previousSibling && $(element.previousSibling).hasClass(spoilerClass))) {
      if (currentBlockGroup.length > 0) {
        spoilerBlockGroups.push(currentBlockGroup);
        currentBlockGroup = [];
      }
    }
    currentBlockGroup.push(element);
  });
  if (currentBlockGroup.length > 0) {
    spoilerBlockGroups.push(currentBlockGroup);
  }
  
  // Having collected the elements into groups, wrap each group.
  for (let spoilerBlockGroup of spoilerBlockGroups) {
    cheerioWrapAll($(spoilerBlockGroup), '<div class="spoilers" />', $);
  }
  
  // Serialize back to HTML.
  return $.html()
}


export async function draftJSToHtmlWithLatex(draftJS) {
  const draftJSWithLatex = await Utils.preProcessLatex(draftJS)
  const html = draftToHTML(convertFromRaw(draftJSWithLatex))
  return wrapSpoilerTags(html)
}

export function htmlToMarkdown(html) {
  return turndownService.turndown(html)
}

export function ckEditorMarkupToMarkdown(markup) {
  // Sanitized CKEditor markup is just html
  return turndownService.turndown(Utils.sanitize(markup))
}

export function markdownToHtmlNoLaTeX(markdown) {
  const randomId = Random.id()
  return mdi.render(markdown, {docId: randomId})
}

export async function markdownToHtml(markdown) {
  const html = markdownToHtmlNoLaTeX(markdown)
  return await mjPagePromise(html, Utils.trimEmptyLatexParagraphs)
}

export function removeCKEditorSuggestions(markup) {
  // First we remove all suggested deletion and modify formatting tags
  const markupWithoutDeletionsAndModifications = markup.replace(
    /<suggestion\s*id="[a-zA-Z0-9:]+"\s*suggestion-type="(deletion|formatInline:[a-zA-Z0-9]+|formatBlock:[a-zA-Z0-9]+)" type="(start|end)"><\/suggestion>/g,
    ''
  )
  // Then we remove everything between suggested insertions
  const markupWithoutInsertions = markupWithoutDeletionsAndModifications.replace(
    /<suggestion\s*id="([a-zA-Z0-9:]+)"\s*suggestion-type="insertion" type="start"><\/suggestion>.*<suggestion\s*id="\1"\s*suggestion-type="insertion"\s*type="end"><\/suggestion>/g,
    ''
  ) 
  return markupWithoutInsertions
}

export async function ckEditorMarkupToHtml(markup) {
  // First we remove any unaccepted suggestions from the markup
  const markupWithoutSuggestions = removeCKEditorSuggestions(markup)
  // Sanitized CKEditor markup is just html
  const html = Utils.sanitize(markupWithoutSuggestions)
  // Render any LaTeX tags we might have in the HTML
  return await mjPagePromise(html, Utils.trimEmptyLatexParagraphs)
}

async function dataToHTML(data, type, sanitize = false) {
  switch (type) {
    case "html":
      return sanitize ? Utils.sanitize(data) : data
    case "ckEditorMarkup":
      return await ckEditorMarkupToHtml(data)
    case "draftJS":
      return await draftJSToHtmlWithLatex(data)
    case "markdown":
      return await markdownToHtml(data)
    default: throw new Error(`Unrecognized format: ${type}`);
  }
}

export function dataToMarkdown(data, type) {
  if (!data) return ""
  switch (type) {
    case "markdown": {
      return data
    }
    case "html": {
      return htmlToMarkdown(data)
    }
    case "ckEditorMarkup": {
      return ckEditorMarkupToMarkdown(data)
    }
    case "draftJS": {
      try {
        const contentState = convertFromRaw(data);
        const html = draftToHTML(contentState)
        return htmlToMarkdown(html)  
      } catch(e) {
        // eslint-disable-next-line no-console
        console.error(e)
      }
      return ""
    }
    default: throw new Error(`Unrecognized format: ${type}`);
  }
}

export async function dataToWordCount(data, type) {
  try {
    const markdown = dataToMarkdown(data, type) || ""
    return markdown.split(" ").length
  } catch(err) {
    // eslint-disable-next-line no-console
    console.error("Error in dataToWordCount", data, type, err)
    return 0
  }
}

function getInitialVersion(document) {
  if (document.draft) {
    return '0.1.0'
  } else {
    return '1.0.0'
  }
}

async function getNextVersion(documentId, updateType = 'minor', fieldName, isDraft) {
  const lastRevision = await Revisions.findOne({documentId: documentId, fieldName}, {sort: {version: -1}}) || {}
  const { major, minor, patch } = extractVersionsFromSemver(lastRevision.version)
  switch (updateType) {
    case "patch":
      return `${major}.${minor}.${patch + 1}`
    case "minor":
      return `${major}.${minor + 1}.0`
    case "major":
      return `${major+1}.0.0`
    case "initial":
      return isDraft ? '0.1.0' : '1.0.0'
    default:
      throw new Error("Invalid updateType, must be one of 'patch', 'minor' or 'major'")
  }
}

ensureIndex(Revisions, {documentId: 1, version: 1, fieldName: 1, editedAt: 1})

export function addEditableCallbacks({collection, options = {}}) {
  const {
    fieldName = "contents",
    pingbacks = false,
    // Because of Meteor shenannigans we don't have access to the full user
    // object when a new user is created, and this creates bugs when we register
    // callbacks that trigger on new user creation. So we allow the deactivation
    // of the new callbacks.
    deactivateNewCallback,
  } = options

  const { typeName } = collection.options

  async function editorSerializationNew (doc, { currentUser }) {
    if (doc[fieldName] && doc[fieldName].originalContents) {
      if (!currentUser) { throw Error("Can't create document without current user") }
      const { data, type } = doc[fieldName].originalContents
      const html = await dataToHTML(data, type, !currentUser.isAdmin)
      const wordCount = await dataToWordCount(data, type)
      const version = getInitialVersion(doc)
      const userId = currentUser._id
      const editedAt = new Date()
      return {
        ...doc,
        [fieldName]: {
          ...doc[fieldName],
          html, version, userId, editedAt, wordCount,
          updateType: 'initial'
        },
        ...(pingbacks ? {
          pingbacks: await htmlToPingbacks(html),
        } : null),
      }
    }
    return doc
  }

  if (!deactivateNewCallback) {
    addCallback(`${typeName.toLowerCase()}.create.before`, editorSerializationNew);
  }

  async function editorSerializationEdit (docData, { document, currentUser }) {
    if (docData[fieldName] && docData[fieldName].originalContents) {
      if (!currentUser) { throw Error("Can't create document without current user") }
      const { data, type } = docData[fieldName].originalContents
      const html = await dataToHTML(data, type, !currentUser.isAdmin)
      const wordCount = await dataToWordCount(data, type)
      const defaultUpdateType = docData[fieldName].updateType || (!document[fieldName] && 'initial') || 'minor'
      const newDocument = {...document, ...docData}
      const isBeingUndrafted = document.draft && !newDocument.draft
      // When a document is undrafted for the first time, we ensure that this constitutes a major update
      const { major } = extractVersionsFromSemver((document[fieldName] && document[fieldName].version) ? document[fieldName].version : undefined)
      const updateType = (isBeingUndrafted && (major < 1)) ? 'major' : defaultUpdateType
      const version = await getNextVersion(document._id, updateType, fieldName, newDocument.draft)
      const userId = currentUser._id
      const editedAt = new Date()
      return {
        ...docData,
        [fieldName]: {
          ...docData[fieldName],
          html, version, userId, editedAt, wordCount
        },
        ...(pingbacks ? {
          pingbacks: await htmlToPingbacks(html),
        } : null),
      }
    }
    return docData
  }
  
  addCallback(`${typeName.toLowerCase()}.update.before`, editorSerializationEdit);

  async function editorSerializationCreateRevision(newDoc, { document }) {
    if (newDoc[fieldName] && newDoc[fieldName].originalContents && 
      (newDoc[fieldName].version !== (document && document[fieldName] && document[fieldName].version))) {
      Revisions.insert({
        ...newDoc[fieldName],
        documentId: newDoc._id,
        fieldName
      })
    }
    return newDoc
  }
  
  addCallback(`${typeName.toLowerCase()}.create.after`, editorSerializationCreateRevision)
  addCallback(`${typeName.toLowerCase()}.update.after`, editorSerializationCreateRevision)
}
