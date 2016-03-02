'use strict';
var React = require('react'),
    Property = require('./Property');

var From = React.createClass({
  handleChange: function(evt) {
    this.props.primitive.dataset(+evt.target.value);
  },

  render: function() {
    var props = this.props,
        pipelines = props.pipelines,
        from = props.from && props.from._id;

    return (
      <Property name="pipeline" label="Pipeline">
        <div className="control">
          <select name="pipeline"
            value={from} onChange={this.handleChange}>
            <option></option>
            {pipelines.map(function(p) {
              return (
                <option key={p._id} value={p._id}>{p.name}</option>
              );
            }, this)}
          </select>
        </div>
      </Property>
    );
  }
});

module.exports = From;
