var React = require('react'),
    Property = require('./Property.jsx'),
    ExtentProperty = require('./ExtentProperty.jsx');

var Rect = React.createClass({
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

        <h3>Fill</h3>

        <Property name="fillColor" label="Color" 
          type="color" canDrop={true}
          scale={update.fill.scale} field={update.fill.field}
          signal={update.fill.signal} />

        <Property name="fillOpacity" label="Opacity" 
          type="range" canDrop={true} min="0" max="1" step="0.05"
          scale={update.fillOpacity.scale} field={update.fillOpacity.field}
          signal={update.fillOpacity.signal} />

        <h3>Stroke</h3>

        <Property name="strokeColor" label="Color" 
          type="color" canDrop={true}
          scale={update.stroke.scale} field={update.stroke.field}
          signal={update.stroke.signal} />

        <Property name="strokeWidth" label="Width" 
          type="range" canDrop={true} min="0" max="10" step="0.25"
          scale={update.strokeWidth.scale} field={update.strokeWidth.field}
          signal={update.strokeWidth.signal} />
      </div>
    )
  }
});

module.exports = Rect;