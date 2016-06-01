'use strict';
var React = require('react'),
    PipelineList = require('./pipelines/PipelineList'),
    assets = require('../util/assets'),
    Icon = require('./Icon');

var PipelineSidebar = React.createClass({
  render: function() {
    return (
      <div className="sidebar" id="pipeline-sidebar">
        <h2>Data Pipelines
          <span className="new" onClick={null}>
            <Icon glyph={assets.plus} /> New
          </span>
        </h2>

        <PipelineList />
      </div>
    );
  }
});

module.exports = PipelineSidebar;
