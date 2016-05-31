'use strict';
var React = require('react'),
    Immutable = require('immutable'),
    PipelineInspector = require('./PipelineInspector');

var PipelineList = React.createClass({
  propTypes: {
    pipelines: React.PropTypes.instanceOf(Immutable.Map)
  },

  render: function() {
    var pipelineInspectors = [];
    this.props.pipelines.forEach(function(pipeline) {
      pipelineInspectors.push(
        <PipelineInspector key={pipeline.get("_id")} pipeline={pipeline} />
      )
    });
    return (
      <div id="pipeline-list">
         {pipelineInspectors}
      </div>
    );
  }
});

module.exports = PipelineList;
