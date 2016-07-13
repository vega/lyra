'use strict';
var React = require('react'),
    Property = require('./Property'),
    Symbol = require('../../store/factory/marks/Symbol');

var SymbolInspector = React.createClass({
  render: function() {
    var props = this.props,
        primitive = props.primitive;

    return (
      <div>

        <div className="property-group">
          <h3>Position</h3>

          <Property name="x" label="X"
            primType="marks"
            primitive={primitive}
            type="number"
            canDrop={true} />

          <Property name="y" label="Y"
            primType="marks"
            primitive={primitive}
            type="number"
            canDrop={true} />
        </div>

        <div className="property-group">
          <h3>Geometry</h3>

          <Property name="size" label="Size"
            primType="marks"
            primitive={primitive}
            type="number"
            canDrop={true} />

          <Property name="shape" label="Shape"
            primType="marks"
            primitive={primitive}
            type="select"
            opts={Symbol.SHAPES}
            canDrop={true} />

        </div>

        <div className="property-group">
          <h3>Fill</h3>

          <Property name="fill" label="Color"
            type="color"
            primType="marks"
            primitive={primitive}
            canDrop={true} />

          <Property name="fillOpacity" label="Opacity"
            primType="marks"
            primitive={primitive}
            type="range"
            min="0" max="1" step="0.05"
            canDrop={true} />

        </div>

        <div className="property-group">
          <h3>Stroke</h3>

          <Property name="stroke" label="Color"
            type="color"
            primType="marks"
            primitive={primitive}
            canDrop={true} />

          <Property name="strokeWidth" label="Width"
            primType="marks"
            primitive={primitive}
            type="range"
            min="0" max="10" step="0.25"
            canDrop={true} />
        </div>
      </div>
    );
  }
});

module.exports = SymbolInspector;
