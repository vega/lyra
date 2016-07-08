'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    updateGuideProperty = require('../../actions/guideActions').updateGuideProperty,
    Property = require('./Property');

function mapStateToProps(state) {
  return {};
}

function mapDispatchToProps(dispatch) {
  return {
    updateGuideProperty: function(guideId, property, value) {
      dispatch(updateGuideProperty(guideId, property, value));
    }
  };
}

var GuideInspector = React.createClass({
  propTypes: {
    primitive: React.PropTypes.object,
    updateGuideProperty: React.PropTypes.func
  },
  handleChange: function(event) {
    var guideId = this.props.primitive._id,
        property = event.target.name,
        value = event.target.value;

    console.log('property: ', property);

    this.props.updateGuideProperty(guideId, property, value);
  },
  render: function() {
    var primitive = this.props.primitive,
        orientOpts = ['top', 'right', 'bottom', 'left'],
        fontOpts = ['Times', 'Sans Serif'];

    return (
      <div>
        <div className="property-group">
          <h3>Axis</h3>
          <Property name="orient" label="Orient"
            opts={orientOpts}
            primitive={primitive}
            onChange={this.handleChange}
            type="select" />
          <Property name="properties.axis.stroke.value"
            label="Color"
            primitive={primitive}
            onChange={this.handleChange}
            type="color" />
          <Property name="properties.axis.strokeWidth.value"
            label="Width"
            primitive={primitive}
            onChange={this.handleChange}
            type="range" />
        </div>
        <div className="property-group">
          <h3>Title</h3>
          <Property name="title" label="Title"
            primitive={primitive}
            type="text" />
          <Property name="titleOffset" label="Offset"
            primitive={primitive}
            type="number" />
          <Property name="fontSize" label="Font Size"
            primitive={primitive}
            type="number">
            <Property name="font" label="Font Type"
              opts={fontOpts}
              primitive={primitive}
              type="select"
              className="extra" />
          </Property>
          <Property name="fill" label="Color"
            primitive={primitive}
            type="color" />
        </div>
        <div className="property-group">
          <h3>Ticks</h3>
          <Property name="ticks" label="Number of Ticks"
            primitive={primitive}
            type="number" />
          <Property name="tickSize" label="Size"
            primitive={primitive}
            type="number" />
          <Property name="stroke" label="Color"
            primitive={primitive}
            type="color" />
          <Property name="strokeWidth" label="Width"
            primitive={primitive}
            type="range" />
          <Property name="tickPadding" label="Padding"
            primitive={primitive}
            type="range" />
          <Property name="tickSize" label="Size"
            primitive={primitive}
            type="number" />
          <Property name="tickSizeMajor" label="Major Tick size"
            primitive={primitive}
            type="number" />
          <Property name="tickSizeMinor" label="Minor Tick size"
            primitive={primitive}
            type="number" />
        </div>
        <div className="property-group">
          <h3>Labels</h3>
          <Property name="fontSize" label="Font Size"
            primitive={primitive}
            type="number">
            <Property name="font" label="Font Type"
              opts={fontOpts}
              primitive={primitive}
              type="select" />
          </Property>
          <Property name="angle" label="Angle"
            primitive={primitive}
            type="number" />
          <Property name="format" label="Format"
            primitive={primitive}
            type="text" />
          <Property name="fill" label="Fill"
            primitive={primitive}
            type="color" />
        </div>
      </div>
    );
  }
});

module.exports = connect(mapStateToProps, mapDispatchToProps)(GuideInspector);
