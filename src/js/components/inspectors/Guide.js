'use strict';
var React = require('react'),
    Property = require('./Property');

var GuideInspector = React.createClass({
  propTypes: {
    primitive: React.PropTypes.object
  },
  render: function() {
    var primitive = this.props.primitive,
        orientOpts = ['top', 'right', 'bottom', 'left'],
        fontOpts = ['Times New Roman', 'Sans Serif'];

    return (
      <div>
        <div className="property-group">
          <h3>Axis</h3>
          <Property name="stroke" label="Color"
            primitive={primitive}
            type="color" />
          <Property name="strokeWidth" label="Width"
            primitive={primitive}
            type="range" />
          <Property name="orient" label="Orient"
            opts={orientOpts}
            primitive={primitive}
            type="select" />
        </div>
        <div className="property-group">
          <h3>Title</h3>
          <Property name="title" label="Text"
            primitive={primitive}
            type="text" />
          <Property name="fontSize" label="Size"
            primitive={primitive}
            type="number">
            <Property name="font"
              opts={fontOpts}
              primitive={primitive}
              type="select"
              className="extra"/>
          </Property>
          <Property name="stroke" label="Color"
            primitive={primitive}
            type="color" />
        </div>
        <div className="property-group">
          <h3>Ticks</h3>
        </div>
        <div className="property-group">
          <h3>Labels</h3>
          {/*<Property name="label" label="Text"
            primitive={primitive}
            type="text" />
          <Property name="fontSize" label="Size"
            primitive={primitive}
            type="number">
            <Property name="font"
              opts={fontOpts}
              primitive={primitive}
              type="select"
              className="extra"/>
          </Property>*/}
        </div>
      </div>
    );
  }
});

module.exports = GuideInspector;
