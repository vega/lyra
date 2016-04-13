'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    getIn = require('../util/immutable-utils').getIn,
    ReactTooltip = require('react-tooltip'),
    InspectorSidebar = require('./InspectorSidebar'),
    VisualSidebar = require('./VisualSidebar'),
    PipelinesSidebar = require('./PipelinesSidebar'),
    Toolbar = require('./Toolbar'),
    Hints = require('./Hints'),
    model = require('../model');

// Use mapDispatchToProps to force sidebar to update when the user makes any
// change which would cause a re-render: this is clumsy but avoids forceUpdate
function mapStateToProps(reduxState) {
  return {
    // Vega "validity" is a good proxy for "has something been added or removed
    // that we need to re-render globally to account for"
    arbitraryPropToTriggerUpdate: getIn(reduxState, 'vega.invalid')
  };
}

// Splitting each sidebar into its column
var Sidebars = React.createClass({
  propTypes: {
    arbitraryPropToTriggerUpdate: React.PropTypes.bool
  },
  classNames: 'row',
  render: function() {
    var pipelines = model.pipeline();
    return (
      <div className={this.classNames}>
        <VisualSidebar />
        <InspectorSidebar ref="inspector"
          pipelines={pipelines} />
        <PipelinesSidebar />
        <Toolbar/>
        <Hints/>
        <ReactTooltip effect="solid"/>
      </div>
    );
  }
});

module.exports = connect(mapStateToProps)(Sidebars);
