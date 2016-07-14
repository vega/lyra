'use strict';

var React = require('react'),
    Property = require('./Property'),
    ExtentProperty = require('./ExtentProperty');

var RectInspector = React.createClass({
  propTypes: {
    primitive: React.PropTypes.object
  },
  render: function() {
    var props = this.props,
        primitive = props.primitive;

    return (
      <div>
        <div className="property-group">
          <h3>X Position</h3>

          <ExtentProperty type="x" {...props} primType="marks"/>
        </div>

        <div className="property-group">
          <h3>Y Position</h3>

          <ExtentProperty type="y" {...props} primType="marks"/>
        </div>

        <div className="property-group">
          <h3>Fill</h3>

          <Property name="fill" label="Color"
            primType="marks"
            primitive={primitive}
            type="color"
            canDrop={true} />

          <Property name="fillOpacity" label="Opacity"
            primType="marks"
            primitive={primitive}
            type="range"
            canDrop={true}
            min="0"
            max="1"
            step="0.05" />
        </div>

        <div className="property-group">
          <h3>Stroke</h3>

          <Property name="stroke" label="Color"
            primType="marks"
            primitive={primitive}
            type="color"
            canDrop={true} />

          <Property name="strokeWidth" label="Width"
            primType="marks"
            primitive={primitive}
            type="range"
            canDrop={true}
            min="0"
            max="10"
            step="0.25" />
        </div>
      </div>
    );
  }
});

module.exports = RectInspector;
