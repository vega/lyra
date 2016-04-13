'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    ReactTooltip = require('react-tooltip'),
    getIn = require('../util/immutable-utils').getIn,
    InspectorSidebar = require('./InspectorSidebar'),
    VisualSidebar = require('./VisualSidebar'),
    PipelinesSidebar = require('./PipelinesSidebar'),
    Toolbar = require('./Toolbar'),
    Hints = require('./Hints'),
    model = require('../model');

// Use mapDispatchToProps to force sidebar to update as marks are added or
// removed; this prop isn't actually used at this level yet.
function mapStateToProps(reduxState) {
  var markIds = Object.keys(getIn(reduxState, 'primitives').toObject());
  return {
    marks: markIds
  };
}

// Splitting each sidebar into its column
var Sidebars = React.createClass({
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
