'use strict';
var React = require('react'),
    PipelineInspector = require('./PipelineInspector'),
    Icon = require('../Icon'),
    assets = require('../../util/assets');

var PipelineList = React.createClass({
  propTypes: {
    pipelines: React.PropTypes.array
  },

  render: function() {
    return (
      <div id="pipeline-list">
        {this.props.pipelines.map(function(p) {
          return (
            <PipelineInspector key={p._id} pipeline={p} />
          );
        }, this)}

        <h3><Icon glyph={assets.plus} /> New Pipeline</h3>
      </div>
    );
  }
});

module.exports = PipelineList;
