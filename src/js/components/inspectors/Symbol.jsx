'use strict';
var React = require('react'),
    Property = require('./Property'),
    Symbol = require('../../model/primitives/marks/Symbol');

var SymbolInspector = React.createClass({
  render: function() {
    var props = this.props,
        primitive = props.primitive;

    return (
      <div>

        <h4 className="hed-tertiary">Position</h4>

        <Property name="x" label="X"
          primitive={primitive}
          type="number"
          canDrop={true} />

        <Property name="y" label="Y"
          primitive={primitive}
          type="number"
          canDrop={true} />

        <h4 className="hed-tertiary">Geometry</h4>

        <Property name="size" label="Size"
          primitive={primitive}
          type="number"
          canDrop={true} />

        <Property name="shape" label="Shape"
          primitive={primitive}
          type="select"
          opts={Symbol.SHAPES}
          canDrop={true} />

        <h4 className="hed-tertiary">Fill</h4>

        <Property name="fill" label="Color"
          type="color"
          primitive={primitive}
          canDrop={true} />

        <Property name="fillOpacity" label="Opacity"
          primitive={primitive}
          type="range"
          min="0" max="1" step="0.05"
          canDrop={true} />

        <h4 className="hed-tertiary">Stroke</h4>

        <Property name="stroke" label="Color"
          type="color"
          primitive={primitive}
          canDrop={true} />

        <Property name="strokeWidth" label="Width"
          primitive={primitive}
          type="range"
          min="0" max="10" step="0.25"
          canDrop={true} />
      </div>
    );
  }
});

module.exports = SymbolInspector;
