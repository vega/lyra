'use strict';
var React = require('react'),
    PipelineList = require('./pipelines/PipelineList'),
    assets = require('../util/assets'),
    Icon = require('./Icon'),
    model = require('../model');

var PipelineSidebar = React.createClass({
  render: function() {
    var pipelines = model.pipeline();
    return (
      <div className="sidebar" id="pipeline-sidebar">
        <h2>Data Pipelines
          <span className="new" onClick={null}>
            <Icon glyph={assets.plus} /> New
          </span>
        </h2>

        <PipelineList pipelines={pipelines} />
      </div>
    );
  }
});

module.exports = PipelineSidebar;
