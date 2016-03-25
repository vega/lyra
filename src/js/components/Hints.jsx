'use strict';
var React = require('react');

// Splitting each sidebar into its column
var Hints = React.createClass({
  classNames: 'hints push6',
  render: function() {
    return (
      <div className={this.classNames}>
        <h3>HINT! Looks like you're... </h3>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas posuere ipsum urna, id ultricies arcu hendrerit ut.</p>
        <i className="close-hint fa fa-times"></i>
      </div>
    );
  }
});

module.exports = Hints;
