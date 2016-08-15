'use strict';
var React = require('react');

var Loader = React.createClass({
  propTypes: {
    loadURL: React.PropTypes.func.isRequired
  },

  handleSubmit: function(evt) {
    this.props.loadURL(evt.target.url.value);
    evt.preventDefault();
  },

  render: function() {
    var props = this.props;
    return (
      <form onSubmit={this.handleSubmit}>
        {
          props.content ? props.content :
          <div>
            <input type="text" name="url" placeholder="Enter url"/>
            <button type="submit" value="Submit" className="button">Load</button>
          </div>
        }
      </form>
    );
  }
});

module.exports = Loader;
