'use strict';
var React = require('react'),
    Property = require('./Property'),
    primTypes = require('../../constants/primTypes'),
    Text = require('../../store/factory/marks/Text');

var TextInspector = React.createClass({
  propTypes: {
    primId: React.PropTypes.number.isRequired,
    primType: primTypes.isRequired
  },
  render: function() {
    var props = this.props;
    return (
      <div>
        <div className="property-group">
          <Property name="text" type="text" canDrop={true} {...props}>
            <h3 className="label">Text</h3>
          </Property>
        </div>

        <div className="property-group">
          <h3>Font</h3>

          <Property name="font" label="Face" type="select"
            opts={Text.fonts} canDrop={true} {...props} />

          <Property name="fontSize" label="Size" type="number"
            canDrop={true} {...props} />

          <Property name="fontWeight" label="Weight" type="select"
            opts={Text.fontWeights} canDrop={true} {...props} />

          <Property name="fontStyle" label="Style" type="select"
            opts={Text.fontStyles} canDrop={true} {...props} />

          <Property name="fill" label="Color" type="color"
            canDrop={true} {...props} />

          <Property name="fillOpacity" label="Opacity" type="range"
            min="0" max="1" step="0.05" canDrop={true} {...props} />
        </div>

        <div className="property-group">
          <h3>Position</h3>

          <Property name="x" label="X" type="number" canDrop={true} {...props} />

          <Property name="y" label="Y" type="number" canDrop={true} {...props} />
        </div>

        <div className="property-group">
          <h3>Offset</h3>

          <Property name="dx" label="X" type="number" canDrop={true} {...props} />

          <Property name="dy" label="Y" type="number" canDrop={true} {...props} />

        </div>

        <div className="property-group">
          <h3>Align</h3>

          <Property name="align" label="Horizontal" type="select"
            opts={Text.alignments} canDrop={true} {...props} />

          <Property name="baseline" label="Vertical" type="select"
            opts={Text.baselines} canDrop={true} {...props} />

          <Property name="angle" label="Rotation" type="number"
            canDrop={true} {...props} />
        </div>
      </div>
    );
  }
});

module.exports = TextInspector;
