'use strict';
var React = require('react'),
    Property = require('./Property');

var Line = React.createClass({
  render: function() {
    var props = this.props,
        primitive = props.primitive,
        update = primitive.properties.update;

    return (
      <div>
        <h4 className="hed-tertiary">Position</h4>

        <Property
          name="x"
          label="X"
          type="number"
          primitive={primitive}
          canDrop={true}
          scale={update.x.scale}
          field={update.x.field}
          signal={update.x.signal}
          />

        <Property
          name="y"
          label="Y"
          type="number"
          primitive={primitive}
          canDrop={true}
          scale={update.y.scale}
          field={update.y.field}
          signal={update.y.signal}
        />

        <h4 className="hed-tertiary">Stroke</h4>

        <Property
          name="stroke"
          label="Color"
          type="color"
          primitive={primitive}
          canDrop={true}
          scale={update.stroke.scale}
          field={update.stroke.field}
          signal={update.stroke.signal}
          />

        <Property
          name="strokeWidth"
          label="Width"
          type="range"
          min="0"
          max="10"
          step="0.25"
          primitive={primitive}
          canDrop={true}
          scale={update.strokeWidth.scale}
          field={update.strokeWidth.field}
          signal={update.strokeWidth.signal}
          />
      </div>
    );
  }
});

module.exports = Line;
