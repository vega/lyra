'use strict';
var React = require('react'),
    Property = require('./Property'),
    primTypes = require('../../constants/primTypes'),
    Symbol = require('../../store/factory/marks/Symbol'),
    propTypes = require('prop-types'),
    createReactClass = require('create-react-class');

var SymbolInspector = createReactClass({
  propTypes: {
    primId: propTypes.number.isRequired,
    primType: primTypes.isRequired
  },

  render: function() {
    var props = this.props;
    return (
      <div>
        <div className="property-group">
          <h3>Position</h3>

          <Property name="x" label="X" type="number" canDrop={true} {...props} />

          <Property name="y" label="Y" type="number" canDrop={true} {...props} />
        </div>

        <div className="property-group">
          <h3>Geometry</h3>

          <Property name="shape" label="Shape" type="select" opts={Symbol.SHAPES}
            canDrop={true} {...props} />

          <Property name="size" label="Size" type="number" canDrop={true} {...props} />

        </div>

        <div className="property-group">
          <h3>Fill</h3>

          <Property name="fill" label="Color" type="color" canDrop={true} {...props} />

          <Property name="fillOpacity" label="Opacity" type="range"
            min="0" max="1" step="0.05" canDrop={true} {...props} />

        </div>

        <div className="property-group">
          <h3>Stroke</h3>

          <Property name="stroke" label="Color" type="color" canDrop={true} {...props} />

          <Property name="strokeWidth" label="Width" type="range"
            min="0" max="10" step="0.25" canDrop={true} {...props} />
        </div>
      </div>
    );
  }
});

module.exports = SymbolInspector;
