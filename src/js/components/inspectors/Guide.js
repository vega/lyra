'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    updateGuideProperty = require('../../actions/guideActions').updateGuideProperty,
    Property = require('./Property'),
    getIn = require('./../../util/immutable-utils').getIn;

function mapStateToProps(state, ownProps) {
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
    updateGuideProperty: React.PropTypes.func,
    guideDefaults: React.PropTypes.object
  },
  handleChange: function(event) {
    var guideId = this.props.primitive._id,
        property = event.target.name,
        value = (event.target.type === 'checkbox') ? event.target.checked :
                event.target.value;

    this.props.updateGuideProperty(guideId, property, value);
  },
  render: function() {

    // previously: var primitive = this.props.primitive
    var primitive = this.props.primitive,
        orientOpts = ['top', 'right', 'bottom', 'left'],
        layerOpts = ['back', 'front'];


    /*

      Values need for axis:
      - current orientation (orient)
      - current properties.axis.stroke.value (color)
      - current properties.axis.strokeWidth.value (width)

      axis = {
        orient: primitive
      }
    */

    return (
      <div>
        <div className="property-group">
          <h3>Axis</h3>
          <Property name="orient"
            label="Orient"
            opts={orientOpts}
            primtype="guides"
            primitive={primitive}
            onChange={this.handleChange}
            type="select" />
          <Property name="properties.axis.stroke.value"
            label="Color"
            primtype="guides"
            primitive={primitive}
            onChange={this.handleChange}
            type="color" />
          <Property name="properties.axis.strokeWidth.value"
            label="Width"
            primtype="guides"
            primitive={primitive}
            onChange={this.handleChange}
            type="range" />
        </div>
        <div className="property-group">
          <h3>Title</h3>
          <Property name="title"
            label="Title"
            primtype="guides"
            primitive={primitive}
            onChange={this.handleChange}
            type="text" />
          <Property name="properties.title.fill.value"
            label="Color"
            primtype="guides"
            primitive={primitive}
            onChange={this.handleChange}
            type="color" />
          <Property name="titleOffset"
            label="Offset"
            primtype="guides"
            primitive={primitive}
            onChange={this.handleChange}
            type="number" />
          <Property name="properties.title.fontSize.value"
            label="Font Size"
            primtype="guides"
            primitive={primitive}
            onChange={this.handleChange}
            type="number" />
        </div>
        <div className="property-group">
          <h3>Ticks</h3>
          <Property name="ticks"
            label="Number of Ticks"
            primtype="guides"
            primitive={primitive}
            onChange={this.handleChange}
            type="number" />
          <Property name="properties.ticks.stroke.value"
            label="Color"
            primtype="guides"
            primitive={primitive}
            onChange={this.handleChange}
            type="color" />
          <Property name="properties.ticks.strokeWidth.value"
            label="Width"
            primtype="guides"
            primitive={primitive}
            onChange={this.handleChange}
            type="range" />
          <Property name="tickPadding"
            label="Padding"
            primtype="guides"
            primitive={primitive}
            onChange={this.handleChange}
            type="range" />
          <Property name="tickSize"
            label="Size"
            primtype="guides"
            primitive={primitive}
            onChange={this.handleChange}
            type="number" />
        </div>
        <div className="property-group">
          <h3>Labels</h3>
          <Property name="properties.labels.fontSize.value"
            label="Font Size"
            primtype="guides"
            primitive={primitive}
            onChange={this.handleChange}
            type="number" />
          <Property name="properties.labels.fill.value"
            label="Fill"
            primtype="guides"
            primitive={primitive}
            onChange={this.handleChange}
            type="color" />
        </div>
        <div className="property-group last">
          <h3>Grid</h3>
          <Property name="grid"
            label="Grid"
            primtype="guides"
            primitive={primitive}
            onChange={this.handleChange}
            type="checkbox" />
          <Property name="layer"
            label="Layer"
            opts={layerOpts}
            primtype="guides"
            primitive={primitive}
            onChange={this.handleChange}
            type="select" />
        </div>
      </div>
    );
  }
});

module.exports = connect(mapStateToProps, mapDispatchToProps)(GuideInspector);
