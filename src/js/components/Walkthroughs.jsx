'use strict';
var React = require('react'),
    WalkthroughStep = require('./walkthrough/Step'),
    connect = require('react-redux').connect,
    getIn = require('../util/immutable-utils').getIn;

function mapStateToProps(state) {
  return {
    showWalkthrough: getIn(state, 'walkthrough.activeWalkthrough')
  };
}

var Walkthroughs = React.createClass({
  render: function() {
    var props = this.props,
        showWalkthrough = props.showWalkthrough,
        walkthroughStep = showWalkthrough ? <WalkthroughStep/> : '';

    return (
      <div>
        {walkthroughStep}
      </div>
    );
  }
});

module.exports = connect(mapStateToProps)(Walkthroughs);
