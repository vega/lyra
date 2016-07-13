'use strict';

var React = require('react');

var ScaleInspector = React.createClass({
  propTypes: {
    primitive: React.PropTypes.object
  },

  render: function() {
    var scale = this.props.primitive;

    return (
      <div>
        <div className="property-group">
          <h3 className="label">Placeholder</h3>
          <ul>
            <li>name: {scale.name}</li>
            <li>type: {scale.type}</li>
            <li>range: {scale.range}</li>
          </ul>
        </div>
      </div>
    );
  }
});

module.exports = ScaleInspector;
