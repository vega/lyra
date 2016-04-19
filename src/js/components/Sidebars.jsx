'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    getIn = require('../util/immutable-utils').getIn,
    ReactTooltip = require('react-tooltip'),
    InspectorSidebar = require('./InspectorSidebar'),
    VisualSidebar = require('./VisualSidebar'),
    PipelinesSidebar = require('./PipelinesSidebar'),
    Toolbar = require('./Toolbar'),
    WalkthroughStep = require('./walkthrough/Step'),
    Footer = require('./Footer'),
    Hints = require('./hints/Hints'),
    model = require('../model');

// Use mapDispatchToProps to force sidebar to update when the user makes any
// change which would cause a re-render: this is clumsy but avoids forceUpdate
function mapStateToProps(reduxState) {
  return {
    // Vega "validity" is a good proxy for "has something been added or removed
    // that we need to re-render globally to account for"
    arbitraryPropToTriggerUpdate: getIn(reduxState, 'vega.invalid'),
    showWalkthrough: getIn(reduxState, 'walkthrough.activeWalkthrough'),
    hintsOn: getIn(reduxState, 'hints.on'),
    hintsDisplay: getIn(reduxState, 'hints.display')
  };
}

var Sidebars = React.createClass({
  propTypes: {
    arbitraryPropToTriggerUpdate: React.PropTypes.bool,
    showWalkthrough: React.PropTypes.string
  },
  render: function() {
    var pipelines = model.pipeline();
    var showWalkthrough = this.props.showWalkthrough ? <WalkthroughStep/> : '';
    var hints = !this.props.showWalkthrough
                && this.props.hintsOn
                && this.props.hintsDisplay ? <Hints/> : '';
    return (
      <div>
        <div className="sidebar-container">
          <VisualSidebar />
          <InspectorSidebar ref="inspector"
            pipelines={pipelines} />
          <PipelinesSidebar />
        </div>
        <Toolbar/>
        {hints}
        {showWalkthrough}
        <Footer/>
        <ReactTooltip effect="solid"/>
      </div>
    );
  }
});

module.exports = connect(mapStateToProps)(Sidebars);
