var d3 = require('d3'),
    React = require('react'),
    PipelineInspector = require('./PipelineInspector.jsx'),
    model = require('../../model');

var PipelineList = React.createClass({
  getInitialState: function() {
    return {
      selected:  0,
      pipelines: model.pipeline()
    };
  },

  pipelines: function() {
    this.setState({ pipelines: model.pipeline() });
  },

  select: function(id) {
    this.setState({ selected: id });
  },

  render: function() {
    return (
      <div>
        <h2>Data Pipelines &nbsp;<i className="fa fa-plus"></i></h2>
        {this.state.pipelines.map(function(p) {
          return (
            <PipelineInspector 
              key={p._id} 
              pipeline={p}
              select={this.select.bind(this, p._id)}
              isSelected={this.state.selected === p._id} />
          );
        }, this)}
      </div>
    )
  }
});

module.exports = PipelineList;
