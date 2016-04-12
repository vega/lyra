'use strict';
var React = require('react'),
    Property = require('./Property'),
    AreaProperty = require('./AreaProperty'),
    Area = require('../../model/primitives/marks/Area');

var AreaInspector = React.createClass({
  render: function() {
    var props = this.props,
        primitive = props.primitive;

    return (
      <div>
        <h4 className="hed-tertiary">X Position</h4>

        <AreaProperty type="x" {...props} />

        <h4 className="hed-tertiary">Y Position</h4>

        <AreaProperty type="y" {...props} />

        <h4 className="hed-tertiary">Fill</h4>

        <Property
          name="fill"
          label="Color"
          type="color"
          primitive={primitive}
          canDrop={true} />

        <Property
          name="fillOpacity"
          label="Opacity"
          primitive={primitive}
          type="range"
          canDrop={true}
          min="0" max="1"
          step="0.05" />

        <h4 className="hed-tertiary">Stroke</h4>

        <Property
          name="stroke"
          label="Color"
          type="color"
          primitive={primitive}
          canDrop={true} />

        <Property
          name="strokeWidth"
          label="Width"
          primitive={primitive}
          type="range"
          canDrop={true}
          min="0"
          max="10"
          step="0.25" />

        <h4>Line Strength</h4>
        <Property
          name="interpolate"
          label="Interpolate"
          primitive={primitive}
          type="select"
          opts={Area.INTERPOLATE}
          canDrop={true} />

        <Property
          name="tension"
          label="Tension"
          type="number"
          primitive={primitive}
          canDrop={true} />
        <h4 className="hed-tertiary">Orientation</h4>
        <Property
          name="orient"
          label="Orient"
          primitive={primitive}
          type="select"
          opts={Area.ORIENT}
          canDrop={true} />
      </div>
    );
  }
});

module.exports = AreaInspector;
