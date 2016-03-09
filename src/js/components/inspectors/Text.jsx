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
          canDrop={true}
          field={update.text.field}
          scale={update.text.scale}
          signal={update.text.signal} />

        <h3>Font</h3>

        <Property name="font" label="Style"
          primitive={primitive}
          type="select"
          opts={['Helvetica', 'Verdana', 'Georgia', 'Palatino', 'Garamond', 'Trebuchet MS']}
          canDrop={true}
          field={update.font.field}
          signal={update.font.signal} />

        <Property name="fontSize" label="Size"
          type="number"
          primitive={primitive}
          canDrop={true}
          field={update.fontSize.field}
          signal={update.fontSize.signal} />

        <Property name="fontWeight" label="Weight"
          primitive={primitive}
          type="select"
          opts={['normal', 'bold']}
          canDrop={true}
          field={update.fontWeight.field}
          signal={update.fontWeight.signal} />

        <Property name="fontStyle" label="Style"
          primitive={primitive}
          type="select"
          opts={['normal', 'italic']}
          canDrop={true}
          field={update.fontStyle.field}
          signal={update.fontStyle.signal} />

        <Property name="fill" label="Color"
          type="color" primitive={primitive} canDrop={true}
          scale={update.fill.scale} field={update.fill.field}
          signal={update.fill.signal} />

        <Property name="fillOpacity" label="Opacity" primitive={primitive}
          type="range" canDrop={true} min="0" max="1" step="0.05"
          scale={update.fillOpacity.scale} field={update.fillOpacity.field}
          signal={update.fillOpacity.signal} />

        <h3>Position</h3>

        <Property name="x" label="X"
          type="number"
          primitive={primitive}
          canDrop={true}
          scale={update.x.scale}
          field={update.x.field}
          signal={update.x.signal} />

        <Property name="y" label="Y"
          type="number"
          primitive={primitive}
          canDrop={true}
          scale={update.y.scale}
          field={update.y.field}
          signal={update.y.signal} />

        <h3>Offset</h3>

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

        <Property name="align" label="Horizontal"
          primitive={primitive}
          type="select"
          opts={['left', 'center', 'right']}
          canDrop={true}
          field={update.align.field}
          signal={update.align.signal} />

        <Property name="baseline" label="Vertical"
          primitive={primitive}
          type="select"
          opts={['top', 'middle', 'bottom']}
          canDrop={true}
          field={update.baseline.field}
          signal={update.baseline.signal} />

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
