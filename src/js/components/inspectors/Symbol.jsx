var React = require('react'),
    Property = require('./Property.jsx'),
    Base = require('../../model/primitives/marks/Symbol');

var Symbol = React.createClass({
  render: function() {
    var props = this.props,
        primitive = props.primitive,
        update = primitive.properties.update;

    return (
      <div>

        <h3>Position</h3>

        <Property name="x" label="X" 
          type="number" canDrop={true}
          scale={update.x.scale} field={update.x.field}
          signal={update.x.signal} />

        <Property name="y" label="Y" 
          type="number" canDrop={true}
          scale={update.y.scale} field={update.y.field}
          signal={update.y.signal} />

        <h3>Geometry</h3>

        <Property name="size" label="Size" 
          type="number" canDrop={true}
          scale={update.size.scale} field={update.size.field}
          signal={update.size.signal} />

        <Property name="shape" label="Shape" 
          type="select" opts={Base.SHAPES} canDrop={true}
          scale={update.shape.scale} field={update.shape.field}
          signal={update.shape.signal} />

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

module.exports = Symbol;