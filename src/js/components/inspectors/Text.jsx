'use strict';
var React = require('react'),
    Property = require('./Property'),
    Text = require('../../model/primitives/marks/Text');

var TextInspector = React.createClass({
  render: function() {
    var props = this.props,
        primitive = props.primitive;

    return (
      <div>
        <h4 className="hed-tertiary">Text</h4>

        <Property name="text" label="Text"
          type="text"
          primitive={primitive}
          canDrop={true} />

        <h4 className="hed-tertiary">Font</h4>

        <Property name="font" label="Font"
          primitive={primitive}
          type="select"
          opts={Text.fonts}
          canDrop={true} />

        <Property name="fontSize" label="Size"
          type="number"
          primitive={primitive}
          canDrop={true} />

        <Property name="fontWeight" label="Weight"
          primitive={primitive}
          type="select"
          opts={Text.fontWeights}
          canDrop={true} />

        <Property name="fontStyle" label="Style"
          primitive={primitive}
          type="select"
          opts={Text.fontStyles}
          canDrop={true} />

        <Property name="fill" label="Color"
          type="color"
          primitive={primitive}
          canDrop={true} />

        <Property name="fillOpacity" label="Opacity"
          type="range"
          primitive={primitive}
          canDrop={true}
          min="0" max="1" step="0.05" />

        <h4 className="hed-tertiary">Position</h4>

        <Property name="x" label="X"
          type="number"
          primitive={primitive}
          canDrop={true} />

        <Property name="y" label="Y"
          type="number"
          primitive={primitive}
          canDrop={true} />

        <h4 className="hed-tertiary">Offset</h4>

        <Property name="dx" label="X"
          type="number"
          primitive={primitive}
          canDrop={true} />

        <Property name="dy" label="Y"
          type="number"
          primitive={primitive}
          canDrop={true} />

        <h4 className="hed-tertiary">Align</h4>

        <Property name="align" label="Horizontal"
          primitive={primitive}
          type="select"
          opts={Text.alignments}
          canDrop={true} />

        <Property name="baseline" label="Vertical"
          primitive={primitive}
          type="select"
          opts={Text.baselines}
          canDrop={true} />

        <Property name="angle" label="Rotation"
          type="number"
          primitive={primitive}
          canDrop={true} />
      </div>
    );
  }
});

module.exports = TextInspector;
