'use strict';
var React = require('react'),
    propTypes = require('prop-types'),
    createReactClass = require('create-react-class');

var Loader = createReactClass({
  propTypes: {
    loadURL: propTypes.func.isRequired
  },

  handleSubmit: function(evt) {
    this.props.loadURL(evt.target.url.value);
    evt.preventDefault();
  },

  render: function() {
    return (
      <form onSubmit={this.handleSubmit}>
        <input type="text" name="url" placeholder="Enter url"/>
        <button type="submit" value="Submit" className="button">Load</button>
      </form>
    );
  }
});

module.exports = Loader;
