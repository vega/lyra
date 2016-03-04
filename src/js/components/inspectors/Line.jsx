'use strict';
var React = require('react'),
    Property = require('./Property'),
    ExtentProperty = require('./ExtentProperty');

var Line = React.createClass({
  render: function() {
    var props = this.props,
        primitive = props.primitive,
        update = primitive.properties.update;

    return (
      <div>
        <h3>X Position</h3>

        <ExtentProperty type="x" {...props} />

        <h3>Y Position</h3>

        <ExtentProperty type="y" {...props} />

        <h3>Stroke</h3>

        <Property name="stroke" label="Color"
          type="color" primitive={primitive} canDrop={true}
          scale={update.stroke.scale} field={update.stroke.field}
          signal={update.stroke.signal} />

        <Property name="strokeWidth" label="Width" primitive={primitive}
          type="range" canDrop={true} min="0" max="10" step="0.25"
          scale={update.strokeWidth.scale} field={update.strokeWidth.field}
          signal={update.strokeWidth.signal} />
      </div>
    );
  }
});

module.exports = Line;
