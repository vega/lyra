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
        value = (event.target.type === 'checkbox') ? event.target.checked :
                event.target.value;

    this.props.updateGuideProperty(guideId, property, value);
  },
  render: function() {
    var primitive = this.props.primitive,
        orientOpts = ['top', 'right', 'bottom', 'left'],
        layerOpts = ['back', 'front'];

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
          <Property name="title"
            label="Title"
            primitive={primitive}
            onChange={this.handleChange}
            type="text" />
          <Property name="titleOffset"
            label="Offset"
            primitive={primitive}
            onChange={this.handleChange}
            type="number" />
          <Property name="properties.title.fontSize.value"
            label="Font Size"
            primitive={primitive}
            onChange={this.handleChange}
            type="number" />
          <Property name="properties.title.fill.value"
            label="Color"
            primitive={primitive}
            onChange={this.handleChange}
            type="color" />
        </div>
        <div className="property-group">
          <h3>Ticks</h3>
          <Property name="ticks"
            label="Number of Ticks"
            primitive={primitive}
            onChange={this.handleChange}
            type="number" />
          <Property name="properties.ticks.stroke.value"
            label="Color"
            primitive={primitive}
            onChange={this.handleChange}
            type="color" />
          <Property name="properties.ticks.strokeWidth.value"
            label="Width"
            primitive={primitive}
            onChange={this.handleChange}
            type="range" />
          <Property name="tickPadding"
            label="Padding"
            primitive={primitive}
            onChange={this.handleChange}
            type="range" />
          <Property name="tickSize"
            label="Size"
            primitive={primitive}
            onChange={this.handleChange}
            type="number" />
          <Property name="tickSizeMajor"
            label="Major Tick size"
            primitive={primitive}
            onChange={this.handleChange}
            type="number" />
          <Property name="tickSizeMinor"
            label="Minor Tick size"
            primitive={primitive}
            onChange={this.handleChange}
            type="number" />
          <Property name="tickSizeEnd"
            label="End Tick size"
            primitive={primitive}
            onChange={this.handleChange}
            type="number" />
        </div>
        <div className="property-group">
          <h3>Labels</h3>
          <Property name="properties.lables.fontSize.value" label="Font Size"
            primitive={primitive}
            onChange={this.handleChange}
            type="number" />
          <Property name="properties.lables.angle.value" label="Angle"
            primitive={primitive}
            onChange={this.handleChange}
            type="number" />
          <Property name="format" label="Format"
            primitive={primitive}
            onChange={this.handleChange}
            type="text" />
          <Property name="properties.lables.fill.value" label="Fill"
            primitive={primitive}
            onChange={this.handleChange}
            type="color" />
        </div>
        <div className="property-group last">
          <h3>Grid</h3>
          <Property name="grid"
            label="Grid"
            primitive={primitive}
            onChange={this.handleChange}
            type="checkbox" />
          <Property name="layer"
            label="Layer"
            opts={layerOpts}
            primitive={primitive}
            onChange={this.handleChange}
            type="select" />
        </div>
      </div>
    );
  }
});

module.exports = connect(mapStateToProps, mapDispatchToProps)(GuideInspector);
