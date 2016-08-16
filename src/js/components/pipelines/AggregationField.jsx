'use strict';
var React = require('react');

var AggregateField = React.createClass({
  propTypes: {
    dsId: React.PropTypes.number,
    className: React.PropTypes.string.isRequired,
    def: React.PropTypes.object,
    schema: React.PropTypes.object
  },
  render: function() {
    return (
      <div>

      </div>
    );
  }
});

module.exports = AggregateField;
