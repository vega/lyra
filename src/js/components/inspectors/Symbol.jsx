'use strict';
var React = require('react'),
    Property = require('./Property'),
    Base = require('../../model/primitives/marks/Symbol');

var Symbol = React.createClass({
  render: function() {
    var props = this.props,
        primitive = props.primitive,
        update = primitive.properties.update;

    return (
      <div>

        <h4 className="header4">Position</h4>

        <Property name="x" label="X" type="number"
          primitive={primitive} canDrop={true}
          scale={update.x.scale} field={update.x.field}
          signal={update.x.signal} />

        <Property name="y" label="Y" type="number"
          primitive={primitive} canDrop={true}
          scale={update.y.scale} field={update.y.field}
          signal={update.y.signal} />

        <h4 className="header4">Geometry</h4>

        <Property name="size" label="Size" type="number"
          primitive={primitive} canDrop={true}
          scale={update.size.scale} field={update.size.field}
          signal={update.size.signal} />

        <Property name="shape" label="Shape" primitive={primitive}
          type="select" opts={Base.SHAPES} canDrop={true}
          scale={update.shape.scale} field={update.shape.field}
          signal={update.shape.signal} />

        <h4 className="header4">Fill</h4>

        <Property name="fill" label="Color" type="color"
          primitive={primitive} canDrop={true}
          scale={update.fill.scale} field={update.fill.field}
          signal={update.fill.signal} />

        <Property name="fillOpacity" label="Opacity"
          type="range" min="0" max="1" step="0.05"
          primitive={primitive} canDrop={true}
          scale={update.fillOpacity.scale} field={update.fillOpacity.field}
          signal={update.fillOpacity.signal} />

        <h4 className="header4">Stroke</h4>

        <Property name="stroke" label="Color" type="color"
          primitive={primitive} canDrop={true}
          scale={update.stroke.scale} field={update.stroke.field}
          signal={update.stroke.signal} />

        <Property name="strokeWidth" label="Width"
          type="range" min="0" max="10" step="0.25"
          primitive={primitive} canDrop={true}
          scale={update.strokeWidth.scale} field={update.strokeWidth.field}
          signal={update.strokeWidth.signal} />
      </div>
    );
  }
});

module.exports = Symbol;
