'use strict';
var d3 = require('d3'),
    React = require('react'),
    ReactDOM = require('react-dom'),
    ContentEditable = require('../ContentEditable.jsx'),
    DataTable = require('./DataTable.jsx');

var PipelineInspector = React.createClass({
  render: function() {
    var props = this.props,
        p = props.pipeline,
        inner = (<span></span>);

    if (props.isSelected) {
      inner = (
        <div className="inner">
          <p className="source"><i className="fa fa-database"></i> {p._source.name}</p>
          <DataTable dataset={p._source} className="source" />
        </div>
      );
    }

    return (
      <div className={'pipeline' + (props.isSelected ? ' selected' : '')}>
        <ContentEditable className="header"
          obj={props.pipeline} prop="name" value={props.pipeline.name}
          onClick={!props.isSelected && props.select} />
        {inner}
      </div>
    );
  }
});

module.exports = PipelineInspector;
