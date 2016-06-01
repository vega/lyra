'use strict';
var React = require('react'),
    Immutable = require('immutable'),
    PipelineInspector = require('./PipelineInspector');

var PipelineList = React.createClass({
  propTypes: {
    pipelines: React.PropTypes.instanceOf(Immutable.Map)
  },

  render: function() {
    return (
      <div id="pipeline-list">
        {this.props.pipelines.map(function(pipeline) {
          return (
            <PipelineInspector key={pipeline.get('_id')} pipeline={pipeline} />
          );
        })}
      </div>
    );
  }
});

module.exports = PipelineList;
