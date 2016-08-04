'use strict';

var React = require('react'),
    DataTable = require('./DataTable');

var DataPreview = React.createClass({
  render: function() {
    var props = this.props;
    return (
      <div className="preview">
        <h4>Preview</h4>
        <DataTable values={props.values} schema={props.schema} className="source" />
      </div>
    );
  }
});

module.exports = DataPreview;
