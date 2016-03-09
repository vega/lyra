'use strict';
var React = require('react'),
    Property = require('./Property'),
    ExtentProperty = require('./ExtentProperty');

var Text = React.createClass({
  render: function() {
    var props = this.props,
        primitive = props.primitive,
        update = primitive.properties.update;

    return (
      <div>
        <h3>Text</h3>

        <Property name="text" label="Text"
          type="text"
          primitive={primitive}
          canDrop={false}
          field={update.text.field}
          scale={update.text.scale}
          signal={update.text.signal} />

        <h3>Font</h3>

        <Property name="fontSize" label="Size"
          type="number"
          primitive={primitive}
          canDrop={true}
          scale={update.fontSize.scale}
          field={update.fontSize.field}
          signal={update.fontSize.signal} />

        <Property name="fill" label="Color"
          type="color" primitive={primitive} canDrop={true}
          scale={update.fill.scale} field={update.fill.field}
          signal={update.fill.signal} />

        <Property name="fillOpacity" label="Opacity" primitive={primitive}
          type="range" canDrop={true} min="0" max="1" step="0.05"
          scale={update.fillOpacity.scale} field={update.fillOpacity.field}
          signal={update.fillOpacity.signal} />

        <h3>Position</h3>

        <Property name="dx" label="X"
          type="number"
          primitive={primitive}
          canDrop={true}
          scale={update.dx.scale}
          field={update.dx.field}
          signal={update.dx.signal} />

        <Property name="dy" label="Y"
          type="number"
          primitive={primitive}
          canDrop={true}
          scale={update.dy.scale}
          field={update.dy.field}
          signal={update.dy.signal} />

        <h3>Align</h3>

        <Property name="angle" label="Rotation"
          type="number"
          primitive={primitive}
          canDrop={true}
          scale={update.angle.scale}
          field={update.angle.field}
          signal={update.angle.signal} />
      </div>
    );
  }
});

module.exports = Text;
