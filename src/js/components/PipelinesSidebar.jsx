'use strict';
var React = require('react'),
    PipelineList = require('./pipelines/PipelineList'),
    model = require('../model');

var PipelineSidebar = React.createClass({
  propTypes: {
    pipelines: React.PropTypes.array
  },
  getInitialState: function() {
    return {
      selected: model.Scene._id,
      expandedLayers: {}
    };
  },
  classNames: 'sidebar col5 push9 pipeline-grid-break dk-blue-bg',
  render: function() {
    var pipelines = model.pipeline();
    return (
      <div className={this.classNames}>
        <header>
          <h2 className="hed">
            Data Pipelines
          </h2>
        </header>
        <PipelineList pipelines={pipelines} />
      </div>
    );
  }
});

module.exports = PipelineSidebar;
