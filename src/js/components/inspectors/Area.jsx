'use strict';
var React = require('react'),
    Property = require('./Property'),
    primTypes = require('../../constants/primTypes'),
    Area = require('../../store/factory/marks/Area'),
    INTERPOLATE = require('../../constants/interpolate');

var AreaInspector = React.createClass({
  propTypes: {
    primId: React.PropTypes.number.isRequired,
    primType: primTypes.isRequired
  },
  render: function() {
    var props = this.props;
    return (
      <div>
        {/*<div className="property-group">
          <h3>Orientation</h3>

          <Property name="orient" label="Orient" type="select"
            opts={Area.ORIENT} {...props} />
        </div>*/}

        <Property name="x" type="number" canDrop={true} {...props}>
          <h3 className="label">X Position</h3>
        </Property>

        <div className="property-group">
          <h3>Y Position</h3>

          <Property name="y" label="Start" type="number" canDrop={true} {...props} />

          <Property name="y2" label="End" type="number" canDrop={true} {...props} />
        </div>

        <div className="property-group">
          <h3>Fill</h3>

          <Property name="fill" label="Color" type="color"
            canDrop={true} {...props} />

          <Property name="fillOpacity" label="Opacity" type="range"
            min="0" max="1" step="0.05" canDrop={true} {...props} />
        </div>

        <div className="property-group">
          <h3>Stroke</h3>

          <Property name="stroke" label="Color" type="color"
            canDrop={true} {...props} />

          <Property name="strokeWidth" label="Width" type="range"
            min="0" max="10" step="0.25" canDrop={true} {...props} />
        </div>

        <div className="property-group">
          <h3>Line Strength</h3>

          <Property name="interpolate" label="Interpolate" type="select"
            opts={INTERPOLATE} canDrop={true} {...props} />

          <Property name="tension" label="Tension" type="number"
            canDrop={true} {...props} />
        </div>
      </div>
    );
  }
});

module.exports = AreaInspector;
