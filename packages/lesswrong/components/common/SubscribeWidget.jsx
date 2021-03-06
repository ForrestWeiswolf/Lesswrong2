import React, { Component } from 'react';
import { registerComponent, Components } from 'meteor/vulcan:core';
import Hidden from '@material-ui/core/Hidden';

class SubscribeWidget extends Component {
  state = {
      dialogOpen: false,
      method: "",
  }

  openDialog(method) {
    this.setState({ dialogOpen: true, method });
  }

  render() {
    const { SeparatorBullet } = Components;
    const { view } = this.props;
    const { dialogOpen, method } = this.state;

    return (
      <React.Fragment>
        <a onClick={ () => this.openDialog("rss") }>
          { /* On very small screens, use shorter link text ("Subscribe (RSS)"
               instead of "Subscribe via RSS") to avoid wrapping */ }
          <Hidden smUp implementation="css">Subscribe (RSS)</Hidden>
          <Hidden xsDown implementation="css">Subscribe via RSS</Hidden>
        </a>
        <SeparatorBullet/>
        <a onClick={ () => this.openDialog("email") }>
          <Hidden smUp implementation="css">Subscribe (Email)</Hidden>
          <Hidden xsDown implementation="css">Subscribe via Email</Hidden>
        </a>
        { dialogOpen && <Components.SubscribeDialog
          open={true}
          onClose={ () => this.setState({ dialogOpen: false })}
          view={view}
          method={method} /> }
      </React.Fragment>
    )
  }
}

registerComponent("SubscribeWidget", SubscribeWidget);
