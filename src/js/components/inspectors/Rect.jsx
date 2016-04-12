'use strict';
var React = require('react'),
    Property = require('./Property'),
    ExtentProperty = require('./ExtentProperty');

var RectInspector = React.createClass({
  render: function() {
    var props = this.props,
        primitive = props.primitive;

    return (
      <div>
        <h4 className="hed-tertiary">X Position</h4>

        <ExtentProperty type="x" {...props} />

        <h4 className="hed-tertiary">Y Position</h4>

        <ExtentProperty type="y" {...props} />

        <h4 className="hed-tertiary">Fill</h4>

        <Property name="fill" label="Color"
          primitive={primitive}
          type="color"
          canDrop={true} />

        <Property name="fillOpacity" label="Opacity"
          primitive={primitive}
          type="range"
          canDrop={true}
          min="0"
          max="1"
          step="0.05" />

        <h4 className="hed-tertiary">Stroke</h4>

        <Property name="stroke" label="Color"
          primitive={primitive}
          type="color"
          canDrop={true} />

        <Property name="strokeWidth" label="Width"
          primitive={primitive}
          type="range"
          canDrop={true}
          min="0"
          max="10"
          step="0.25" />
      </div>
    );
  }
});

module.exports = RectInspector;
