'use strict';
var React = require('react'),
    Property = require('./Property'),
    ExtentProperty = require('./ExtentProperty');

var RectInspector = React.createClass({
  propTypes: {
    primitive: React.PropTypes.object
  },
  render: function() {
    var props = this.props,
        primitive = Object.assign({}, this.props.primitive, {_stateType: 'mark'});

    return (
      <div>
        <div className="property-group">
          <h3>X Position</h3>

          <ExtentProperty type="x" {...props} />
        </div>

        <div className="property-group">
          <h3>Y Position</h3>

          <ExtentProperty type="y" {...props} />
        </div>

        <div className="property-group">
          <h3>Fill</h3>

          <Property name="fill" label="Color"
            primitive={primitive}
            type="color"
            canDrop={true} />

          <Property name="fillOpacity" label="Opacity"
            primitive={primitive}
            type="range"
            canDrop={true}
            min="0"
            max="1"
            step="0.05" />
        </div>

        <div className="property-group">
          <h3>Stroke</h3>

          <Property name="stroke" label="Color"
            primitive={primitive}
            type="color"
            canDrop={true} />

          <Property name="strokeWidth" label="Width"
            primitive={primitive}
            type="range"
            canDrop={true}
            min="0"
            max="10"
            step="0.25" />
        </div>
      </div>
    );
  }
});

module.exports = RectInspector;
