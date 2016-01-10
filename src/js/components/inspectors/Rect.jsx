var React = require('react'),
    Property = require('./Property.jsx');

var Rect = React.createClass({
  render: function() {
    var primitive = this.props.primitive,
        update = primitive.properties.update;

    return (
      <div>
        <h3>X Position</h3>




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