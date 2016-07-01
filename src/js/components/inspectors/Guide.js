'use strict';
var React = require('react'),
    Property = require('./Property');

var GuideInspector = React.createClass({
  // propTypes: {
  //   primitive: React.PropTypes.instanceOf(Immutable.Map)
  // },
  render: function() {
    var primitiveWrapper = Object.assign({}, this.props.primitive, {_primType: 'Guide'});

    console.log('primitives: ', primitiveWrapper);

    return (
      <div>
        <div className="property-group">
          <h3>Axis</h3>
          <Property name="scale"
            primitive={primitiveWrapper}
            label="Scale"
            type="number"/>
        </div>
        <div className="property-group">
          <h3>Title</h3>
        </div>
        <div className="property-group">
          <h3>Ticks</h3>
        </div>
        <div className="property-group">
          <h3>Labels</h3>
        </div>
      </div>
    );
  }
});

module.exports = GuideInspector;
