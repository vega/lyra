'use strict';
var React = require('react'),
    Steps = require('./walkthrough/Steps'),
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
        walkthroughStep = showWalkthrough ? <Steps /> : '';

    return (
      <div>
        {walkthroughStep}
      </div>
    );
  }
});

module.exports = connect(mapStateToProps)(Walkthroughs);
