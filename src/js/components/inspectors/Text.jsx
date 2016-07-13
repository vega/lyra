'use strict';
var React = require('react'),
    Property = require('./Property'),
    Text = require('../../store/factory/marks/Text');

var TextInspector = React.createClass({
  render: function() {
    var props = this.props,
        primitive = props.primitive;

    return (
      <div>
        <div className="property-group">
          <Property name="text"
            type="text"
            primType="marks"
            primitive={primitive}
            canDrop={true}>

            <h3 className="label">Text</h3>
          </Property>
        </div>

        <div className="property-group">
          <h3>Font</h3>

          <Property name="font" label="Face"
            type="select"
            opts={Text.fonts}
            primType="marks"
            primitive={primitive}
            canDrop={true} />

          <Property name="fontSize" label="Size"
            type="number"
            primType="marks"
            primitive={primitive}
            canDrop={true} />

          <Property name="fontWeight" label="Weight"
            primType="marks"
            primitive={primitive}
            type="select"
            opts={Text.fontWeights}
            canDrop={true} />

          <Property name="fontStyle" label="Style"
            primType="marks"
            primitive={primitive}
            type="select"
            opts={Text.fontStyles}
            canDrop={true} />

          <Property name="fill" label="Color"
            type="color"
            primType="marks"
            primitive={primitive}
            canDrop={true} />

          <Property name="fillOpacity" label="Opacity"
            type="range"
            primType="marks"
            primitive={primitive}
            canDrop={true}
            min="0" max="1" step="0.05" />
        </div>

        <div className="property-group">
          <h3>Position</h3>

          <Property name="x" label="X"
            type="number"
            primType="marks"
            primitive={primitive}
            canDrop={true} />

          <Property name="y" label="Y"
            type="number"
            primType="marks"
            primitive={primitive}
            canDrop={true} />
        </div>

        <div className="property-group">
          <h3>Offset</h3>

          <Property name="dx" label="X"
            type="number"
            primType="marks"
            primitive={primitive}
            canDrop={true} />

          <Property name="dy" label="Y"
            type="number"
            primType="marks"
            primitive={primitive}
            canDrop={true} />

        </div>

        <div className="property-group">
          <h3>Align</h3>

          <Property name="align" label="Horizontal"
            primType="marks"
            primitive={primitive}
            type="select"
            opts={Text.alignments}
            canDrop={true} />

          <Property name="baseline" label="Vertical"
            primType="marks"
            primitive={primitive}
            type="select"
            opts={Text.baselines}
            canDrop={true} />

          <Property name="angle" label="Rotation"
            type="number"
            primType="marks"
            primitive={primitive}
            canDrop={true} />
        </div>
      </div>
    );
  }
});

module.exports = TextInspector;
