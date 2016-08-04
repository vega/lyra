'use strict';
var React = require('react');

var Form = React.createClass({
  render: function() {
    var props = this.props;
    return (
      <form onSubmit={props.handleSubmit}>
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

module.exports = Form;
