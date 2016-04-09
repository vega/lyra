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
            <PipelineInspector key={p._id} pipeline={p} />
          );
        }, this)}

        <h3><i className="fa fa-plus"></i> New Pipeline</h3>
      </div>
    );
  }
});

module.exports = PipelineList;
