import React from 'react';
import { addRoute, getSetting } from 'meteor/vulcan:core';

const communitySubtitle = { subtitleLink: "/community", subtitle: "Community" };
const rationalitySubtitle = { subtitleLink: "/rationality", subtitle: "Rationality: A-Z" };
const hpmorSubtitle = { subtitleLink: "/hpmor", subtitle: "HPMoR" };
const codexSubtitle = { subtitleLink: "/codex", subtitle: "SlateStarCodex" };
const metaSubtitle = { subtitleLink: "/meta", subtitle: "Meta" };

addRoute([
  // User-profile routes
  {
    name:'users.single',
    path:'/users/:slug',
    componentName: 'UsersSingle',
    //titleHoC: userPageTitleHoC,
    titleComponentName: 'UserPageTitle',
    subtitleComponentName: 'UserPageTitle',
  },
  {
    name:'users.single.user',
    path:'/user/:slug',
    componentName: 'UsersSingle'
  },
  {
    name:'users.single.u',
    path:'/u/:slug',
    componentName: 'UsersSingle'
  },
  {
    name:'users.account',
    path:'/account',
    componentName: 'UsersAccount'
  },
  {
    name:'users.edit',
    path:'/users/:slug/edit',
    componentName: 'UsersAccount'
  },

  // Miscellaneous LW2 routes
  {
    name: 'login',
    path: '/login',
    componentName: 'LoginPage',
    title: "Login"
  },
  {
    name: 'resendVerificationEmail',
    path: '/resendVerificationEmail',
    componentName: 'ResendVerificationEmailPage'
  },
  {
    name: 'inbox',
    path: '/inbox',
    componentName: 'InboxWrapper',
    title: "Inbox"
  },
  {
    name: 'conversation',
    path: '/inbox/:_id',
    componentName: 'ConversationWrapper',
    title: "Private Conversation"
  },

  {
    name: 'newPost',
    path: '/newPost',
    componentName: 'PostsNewForm',
    title: "New Post"
  },
  {
    name: 'editPost',
    path: '/editPost',
    componentName: 'PostsEditPage'
  },

  // Sequences
  {
    name: 'sequencesHome',
    path: '/library',
    componentName: 'SequencesHome',
    title: "The Library"
  },
  {
    name: 'sequences.single.old',
    path: '/sequences/:_id',
    componentName: 'SequencesSingle'
  },
  {
    name: 'sequences.single',
    path: '/s/:_id',
    componentName: 'SequencesSingle',
    titleComponentName: 'SequencesPageTitle',
    subtitleComponentName: 'SequencesPageTitle',
  },
  {
    name: 'sequencesEdit',
    path: '/sequencesEdit/:_id',
    componentName: 'SequencesEditForm'
  },
  {
    name: 'sequencesNew',
    path: '/sequencesNew',
    componentName: 'SequencesNewForm',
    title: "New Sequence"
  },
  {
    name: 'sequencesPost',
    path: '/s/:sequenceId/p/:postId',
    componentName: 'SequencesPost',
    previewComponentName: 'PostLinkPreviewSequencePost',
  },

  {
    name: 'chaptersEdit',
    path: '/chaptersEdit/:_id',
    componentName: 'ChaptersEditForm',
    title: "Edit Chapter"
  },

  // Collections
  {
    name: 'collections',
    path: '/collections/:_id',
    componentName: 'CollectionsSingle'
  },
  {
    name: 'Sequences',
    path: '/sequences',
    componentName: 'CoreSequences',
    title: "Rationality: A-Z"
  },
  {
    name: 'Rationality',
    path: '/rationality',
    componentName: 'CoreSequences',
    title: "Rationality: A-Z",
    ...rationalitySubtitle
  },
  {
    name: 'Rationality.posts.single',
    path: '/rationality/:slug',
    componentName: 'PostsSingleSlug',
    previewComponentName: 'PostLinkPreviewSlug',
    ...rationalitySubtitle
  },
  {
    name: 'bookmarks',
    path: '/bookmarks',
    componentName: 'BookmarksPage',
    titleComponentName: 'UserPageTitle',
    subtitleComponentName: 'UserPageTitle',
  }
]);


// Because the EA Forum was identical except for the change from /lw/ to /ea/
const legacyRouteAcronym = getSetting('legacyRouteAcronym', 'lw')

addRoute([
  // Legacy (old-LW, also old-EAF) routes
  // Note that there are also server-side-only routes in server/legacy-redirects/routes.js.
  {
    name: 'post.legacy',
    path: `/:section(r)?/:subreddit(all|discussion|lesswrong)?/${legacyRouteAcronym}/:id/:slug?`,
    componentName: "LegacyPostRedirect",
    previewComponentName: "PostLinkPreviewLegacy",
  },
  {
    name: 'comment.legacy',
    path: `/${legacyRouteAcronym}/:id/:slug/:commentId`,
    componentName: "LegacyCommentRedirect",
    previewComponentName: "CommentLinkPreviewLegacy",
  }
]);

if (getSetting('forumType') === 'LessWrong') {
  addRoute([
    {
      name: 'HPMOR',
      path: '/hpmor',
      componentName: 'HPMOR',
      title: "Harry Potter and the Methods of Rationality",
      ...hpmorSubtitle,
    },
    {
      name: 'HPMOR.posts.single',
      path: '/hpmor/:slug',
      componentName: 'PostsSingleSlug',
      previewComponentName: 'PostLinkPreviewSlug',
      ...hpmorSubtitle,
    },

    {
      name: 'Codex',
      path: '/codex',
      componentName: 'Codex',
      title: "The Codex",
      ...codexSubtitle,
    },
    {
      name: 'Codex.posts.single',
      path: '/codex/:slug',
      componentName: 'PostsSingleSlug',
      previewComponentName: 'PostLinkPreviewSlug',
      ...codexSubtitle,
    },
  ]);
}

addRoute([
  {
    name: 'AllComments',
    path: '/allComments',
    componentName: 'AllComments',
    title: "All Comments"
  },
  {
    name: 'Shortform',
    path: '/shortform',
    componentName: 'ShortformPage',
    title: "Shortform"
  },
]);

if (getSetting('hasEvents', true)) {
  addRoute([
    {
      name: 'EventsPast',
      path: '/pastEvents',
      componentName: 'EventsPast',
      title: "Past Events by Day"
    },
    {
      name: 'EventsUpcoming',
      path: '/upcomingEvents',
      componentName: 'EventsUpcoming',
      title: "Upcoming Events by Day"
    },

    {
      name: 'CommunityHome',
      path: '/community',
      componentName: 'CommunityHome',
      title: "Community",
      ...communitySubtitle
    },
    {
      name: 'MeetupsHome',
      path: '/meetups',
      componentName: 'CommunityHome',
      title: "Community"
    },

    {
      name: 'AllLocalGroups',
      path: '/allgroups',
      componentName: 'AllGroupsPage',
      title: "All Local Groups"
    },

    {
      name:'Localgroups.single',
      path: '/groups/:groupId',
      componentName: 'LocalGroupSingle',
      ...communitySubtitle
    },
    {
      name:'events.single',
      path: '/events/:_id/:slug?',
      componentName: 'PostsSingle',
      previewComponentName: 'PostLinkPreview',
      ...communitySubtitle
    },
    {
      name: 'groups.post',
      path: '/g/:groupId/p/:_id',
      componentName: 'PostsSingle',
      previewComponentName: 'PostLinkPreview',
      ...communitySubtitle
    },
  ]);
}

addRoute([
  {
    name: 'searchTest',
    path: '/searchTest',
    componentName: 'SearchBar'
  },
  {
    name: 'postsListEditorTest',
    path:'/postsListEditorTest',
    componentName: 'PostsListEditor'
  },
  {
    name: 'imageUploadTest',
    path: '/imageUpload',
    componentName: 'ImageUpload'
  },
]);

addRoute([
  {
    name:'posts.single',
    path:'/posts/:_id/:slug?',
    componentName: 'PostsSingle',
    titleComponentName: 'PostsPageHeaderTitle',
    subtitleComponentName: 'PostsPageHeaderTitle',
    previewComponentName: 'PostLinkPreview',
    getPingback: (parsedUrl) => ({ collectionName: "Posts", documentId: parsedUrl.params._id })
  },
  {
    name: 'admin',
    path: '/admin',
    componentName: 'AdminHome',
    title: "Admin"
  },
  {
    name: 'moderation',
    path: '/moderation',
    componentName: 'ModerationLog',
    title: "Moderation Log"
  },
  {
    name: 'emailHistory',
    path: '/debug/emailHistory',
    componentName: 'EmailHistoryPage'
  },
]);

addRoute([
  // GreaterWrong comment (mostly for use with hover previews)
  // TODO: Make this properly show the comment as if it were a regular permalink
  // (not high priority because it's only relevant when greaterwrong links to things AND
  // someone wants to manually copy/paste switch the link, switching the url from greaterwrong
  // to lesswrong)
  {
    path:'/posts/:_id/:slug/comment/:commentId?',
    name: 'comment.greaterwrong',
    componentName: "PostsSingle",
    titleComponentName: 'PostsPageHeaderTitle',
    subtitleComponentName: 'PostsPageHeaderTitle',
    previewComponentName: "PostCommentLinkPreviewGreaterWrong",
  }
]);

switch (getSetting('forumType')) {
  case 'AlignmentForum':
    addRoute([
      {
        name:'alignment.home',
        path:'/',
        componentName: 'AlignmentForumHome'
      },
      {
        name:'about',
        path:'/about',
        componentName: 'PostsSingleRoute',
        _id:"FoiiRDC3EhjHx7ayY"
      },
      {
        name: 'Meta',
        path: '/meta',
        componentName: 'Meta',
        title: "Meta",
        ...metaSubtitle
      },
    ]);
    break
  case 'EAForum':
    addRoute([
      {
        name: 'home',
        path: '/',
        componentName: 'EAHome'
      },
      {
        name:'about',
        path:'/about',
        componentName: 'PostsSingleRoute',
        _id:"Y2iqhjAHbXNkwcS8F"
      },
      {
        name: 'Community',
        path: '/meta',
        componentName: 'Meta',
        title: "Community"
      },
    ]);
    break
  default:
    // Default is Vanilla LW
    addRoute([
      {
        name: 'home',
        path: '/',
        componentName: 'Home2'
      },
      {
        name: 'about',
        path: '/about',
        componentName: 'PostsSingleRoute',
        _id:"bJ2haLkcGeLtTWaD5"
      },
      {
        name: 'faq',
        path: '/faq',
        componentName: 'PostsSingleRoute',
        _id:"2rWKkWuPrgTMpLRbp"
      },
      {
        name: 'Meta',
        path: '/meta',
        componentName: 'Meta',
        title: "Meta"
      },
    ]);
    break;
}

addRoute([
  {
    name: 'home2',
    path: '/home2',
    componentName: 'Home2',
    title: "Home2 Beta",
  },
  {
    name: 'allPosts',
    path: '/allPosts',
    componentName: 'AllPostsPage',
    title: "All Posts",
  },
  {
    name: 'questions',
    path: '/questions',
    componentName: 'QuestionsPage',
    title: "All Questions",
  },
  {
    name: 'recommendations',
    path: '/recommendations',
    componentName: 'RecommendationsPage',
    title: "Recommendations",
  },
  {
    name: 'emailToken',
    path: '/emailToken/:token',
    componentName: 'EmailTokenPage',
  },
]);
