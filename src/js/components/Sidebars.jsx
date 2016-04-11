'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    getIn = require('../util/immutable-utils').getIn,
    ReactTooltip = require('react-tooltip'),
    connect = require('react-redux').connect,
    getIn = require('../util/immutable-utils').getIn,
    InspectorSidebar = require('./InspectorSidebar'),
    VisualSidebar = require('./VisualSidebar'),
    PipelinesSidebar = require('./PipelinesSidebar'),
    Toolbar = require('./Toolbar'),
    Hints = require('./walkthrough/hints'),
    Footer = require('./Footer'),
    model = require('../model');


// Use mapDispatchToProps to force sidebar to update when the user makes any
// change which would cause a re-render: this is clumsy but avoids forceUpdate
function mapStateToProps(reduxState) {
  var show = getIn(reduxState, 'walkthrough.walkthroughMode');
  return {
    // Vega "validity" is a good proxy for "has something been added or removed
    // that we need to re-render globally to account for"
    arbitraryPropToTriggerUpdate: getIn(reduxState, 'vega.invalid'),
    showHints: show
  };
}

var Sidebars = React.createClass({
  propTypes: {
    arbitraryPropToTriggerUpdate: React.PropTypes.bool
  },
  render: function() {
    var pipelines = model.pipeline();
    var showHints = this.props.showHints ? <Hints/> : '';
    return (
      <div className="sidebar-container">
        <VisualSidebar />
        <InspectorSidebar ref="inspector"
          pipelines={pipelines} />
        <PipelinesSidebar />
        <Toolbar/>
        {showHints}
        <Footer/>
        <ReactTooltip effect="solid"/>
      </div>
    );
  }
});

module.exports = connect(mapStateToProps)(Sidebars);
