'use strict';
var React = require('react'),
    PipelineInspector = require('./PipelineInspector');

var PipelineList = React.createClass({
  propTypes: {
    pipelines: React.PropTypes.array
  },

  render: function() {
    return (
      <div id="pipeline-list">
        {this.props.pipelines.map(function(p) {
          return (
            <PipelineInspector key={p.id} pipeline={p} />
          );
        }, this)}
      </div>
    );
  }
});

module.exports = PipelineList;
