'use strict';
var React = require('react');

var Errors = React.createClass({
  classNames: 'error',
  render: function() {
    var props = this.props;
    return (
      <div className="error">
        <p>{props.message}</p>
        <ul>
          {props.errors.map(function(error, i) {
            return (<li key={i}>{error}</li>);
          })}
        </ul>
      </div>
    );
  }
});

module.exports = Errors;
