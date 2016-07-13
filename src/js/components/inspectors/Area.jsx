'use strict';
var React = require('react'),
    Property = require('./Property'),
    AreaProperty = require('./AreaProperty'),
    Area = require('../../store/factory/marks/Area'),
    INTERPOLATE = require('../../constants/interpolate');

var AreaInspector = React.createClass({
  render: function() {
    var props = this.props,
        primitive = props.primitive;

    return (
      <div>
        <div className="property-group">
          <h3>Orientation</h3>

          <Property
            name="orient"
            label="Orient"
            primType="marks"
            primitive={primitive}
            type="select"
            opts={Area.ORIENT}
            canDrop={true} />
        </div>

        <div className="property-group">
          <h3>X Position</h3>

          <AreaProperty type="x" {...props} primType="marks"/>
        </div>

        <div className="property-group">
          <h3>Y Position</h3>

          <AreaProperty type="y" {...props} primType="marks"/>
        </div>

        <div className="property-group">
          <h3>Fill</h3>

          <Property
            name="fill"
            label="Color"
            type="color"
            canDrop={true}
            primType="marks"
            primitive={primitive}/>

          <Property
            name="fillOpacity"
            label="Opacity"
            type="range"
            min="0" max="1" step="0.05"
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
            min="0" max="10" step="0.25"
            canDrop={true}
            primType="marks"
            primitive={primitive} />
        </div>

        <div className="property-group">
          <h3>Line Strength</h3>

          <Property
            name="interpolate"
            label="Interpolate"
            type="select"
            opts={INTERPOLATE}
            canDrop={true}
            primType="marks"
            primitive={primitive}
          />

          <Property
            name="tension"
            label="Tension"
            type="number"
            canDrop={true}
            primType="marks"
            primitive={primitive}
          />
        </div>
      </div>
    );
  }
});

module.exports = AreaInspector;
