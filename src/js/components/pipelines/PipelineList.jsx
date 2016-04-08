'use strict';
var React = require('react'),
    PipelineInspector = require('./PipelineInspector');

var PipelineList = React.createClass({
  propTypes: {
    pipelines: React.PropTypes.array
  },

  getInitialState: function() {
    return {selected: 0};
  },

  select: function(id) {
    this.setState({selected: id});
  },

  render: function() {
    return (
      <div id="pipeline-list">
        {this.props.pipelines.map(function(p) {
          return (
            <PipelineInspector
              key={p._id}
              pipeline={p}
              select={this.select.bind(this, p._id)}
              isSelected={this.state.selected === p._id} />
          );
        }, this)}

        <h3><i className="fa fa-plus"></i> New Pipeline</h3>
      </div>
    );
  }
});

module.exports = PipelineList;
