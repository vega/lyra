'use strict';
var React = require('react'),
    Property = require('./Property');

var Line = React.createClass({
  render: function() {
    var props = this.props,
        primitive = props.primitive;

    return (
      <div>
        <h4 className="hed-tertiary">Position</h4>

        <Property
          name="x"
          label="X"
          type="number"
          primitive={primitive}
          canDrop={true} />

        <Property
          name="y"
          label="Y"
          type="number"
          primitive={primitive}
          canDrop={true} />

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
          type="range"
          min="0"
          max="10"
          step="0.25"
          primitive={primitive}
          canDrop={true} />
      </div>
    );
  }
});

module.exports = Line;
