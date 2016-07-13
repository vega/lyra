'use strict';
var React = require('react'),
    Property = require('./Property'),
    INTERPOLATE = require('../../constants/interpolate');

var LineInspector = React.createClass({
  render: function() {
    var primitive = this.props.primitive;

    return (
      <div>
        <div className="property-group">
          <h3>Position</h3>

          <Property
            name="x"
            label="X"
            type="number"
            primType="marks"
            primitive={primitive}
            canDrop={true} />

          <Property
            name="y"
            label="Y"
            type="number"
            primType="marks"
            primitive={primitive}
            canDrop={true} />
        </div>

        <div className="property-group">
          <h3>Stroke</h3>

          <Property
            name="stroke"
            label="Color"
            type="color"
            primType="marks"
            primitive={primitive}
            canDrop={true} />

          <Property
            name="strokeWidth"
            label="Width"
            type="range"
            min="0"
            max="10"
            step="0.25"
            primType="marks"
            primitive={primitive}
            canDrop={true} />
        </div>

        <div className="property-group">
          <h3>Line Strength</h3>

          <Property
            name="interpolate"
            label="Interpolate"
            type="select"
            opts={INTERPOLATE}
            primType="marks"
            primitive={primitive}
            canDrop={true}
          />

          <Property
            name="tension"
            label="Tension"
            type="number"
            primType="marks"
            primitive={primitive}
            canDrop={true}
            />
        </div>
      </div>
    );
  }
});

module.exports = LineInspector;
