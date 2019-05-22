import React from 'react';
import { Components, registerComponent } from 'meteor/vulcan:core';
import { getFragment } from 'meteor/vulcan:core';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import withUser from '../common/withUser';
import { defaultAlgorithmSettings } from '../../lib/collections/users/recommendationSettings.js';

const withRecommendations = component => {
  // FIXME: For some unclear reason, using a ...fragment in the 'sequence' part
  // of this query doesn't work (leads to a 400 Bad Request), so this is expanded
  // out to a short list of individual fields.
  const recommendationsQuery = gql`
    query RecommendationsQuery($count: Int, $algorithm: JSON) {
      Recommendations(count: $count, algorithm: $algorithm) {
        posts {
          ...PostsList
        }
        resumeReading {
          sequence {
            _id
            title
            gridImageId
            canonicalCollectionSlug
          }
          collection {
            _id
            title
            slug
          }
          lastReadPost {
            ...PostsList
          }
          nextPost {
            ...PostsList
          }
          numRead
          numTotal
        }
      }
    }
    ${getFragment("PostsList")}
  `;

  return graphql(recommendationsQuery,
    {
      alias: "withRecommendations",
      options: (props) => ({
        variables: {
          count: props.algorithm?.count || 10,
          algorithm: props.algorithm || defaultAlgorithmSettings,
        }
      }),
      props(props) {
        return {
          recommendationsLoading: props.data.loading,
          recommendations: props.data.Recommendations,
        }
      }
    }
  )(component);
}

const withDismissRecommendation = component => {
  return graphql(gql`
    mutation dismissRecommendation($postId: String) {
      dismissRecommendation(postId: $postId)
    }
  `, {
    props: ({ownProps, mutate}) => ({
      dismissRecommendation: async ({postId}) => {
        await mutate({
          variables: {
            postId: postId
          },
        });
      }
    })
  })(component);
}

const RecommendationsList = ({ recommendations, recommendationsLoading, currentUser, dismissRecommendation }) => {
  const { PostsItem2, PostsLoading } = Components;
  if (recommendationsLoading || !recommendations)
    return <PostsLoading/>
  
  return <div>
    {recommendations.resumeReading.map(resumeReading =>
      <PostsItem2
        post={resumeReading.nextPost}
        resumeReading={resumeReading}
        dismissRecommendation={() => dismissRecommendation({postId: resumeReading.nextPost._id})}
        key={resumeReading.sequence?._id || resumeReading.collection?._id}
      />)}
    {recommendations.posts.map(post =>
      <PostsItem2 post={post} key={post._id}/>)}
    {recommendations.posts.length===0 && recommendations.resumeReading.length==0 &&
      <span>There are no more recommendations left.</span>}
  </div>
}

registerComponent('RecommendationsList', RecommendationsList,
  withRecommendations,
  withDismissRecommendation,
  withUser
);

