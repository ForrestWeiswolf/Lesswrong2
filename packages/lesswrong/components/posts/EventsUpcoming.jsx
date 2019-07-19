import { Components, registerComponent } from 'meteor/vulcan:core';
import React from 'react';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  daily: {
    padding: theme.spacing.unit
  }
})

const EventsUpcoming = ({ classes }) => {
  const { SingleColumnSection, SectionTitle, PostsList2 } = Components
  const terms = { view: 'upcomingEvents', limit: 20 }

  return (
    <SingleColumnSection>
      <SectionTitle title="Upcoming Events"/>
      {/* TODO-Q-ForPR I removed 'days' from here, as PostsList2 does not accept
          it. Plausibly we'd rather have this be PostsDaily? */}
      <PostsList2 terms={terms}/>
    </SingleColumnSection>
  )
}

registerComponent('EventsUpcoming', EventsUpcoming, withStyles(styles, {name: "EventsUpcoming"}));
