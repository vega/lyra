var d3 = require('d3'),
    React = require('react'),
    PipelineInspector = require('./PipelineInspector.jsx');

var PipelineList = React.createClass({
  getInitialState: function() {
    return {selected: 0};
  },

  select: function(id) {
    this.setState({ selected: id });
  },

  render: function() {
    return (
      <div id="pipeline-list">
        <h2>Data Pipelines <i className="fa fa-plus"></i></h2>
        {this.props.pipelines.map(function(p) {
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
