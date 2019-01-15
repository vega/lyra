'use strict';
var React = require('react'),
    Property = require('./Property'),
    MoreProperties = require('./MoreProperties'),
    primTypes = require('../../constants/primTypes'),
    propTypes = require('prop-types'),
    createReactClass = require('create-react-class');

var AxisInspector = createReactClass({
  propTypes: {
    primId: propTypes.number.isRequired,
    primType: primTypes.isRequired,
    handleChange: propTypes.func
  },

  render: function() {
    var props = this.props,
        handleChange = props.handleChange,
        orientOpts = ['top', 'bottom', 'left', 'right'],
        layerOpts = ['back', 'front'],
        axis   = 'properties.axis.',
        title  = 'properties.title.',
        labels = 'properties.labels.',
        grid = 'properties.grid.',
        ticks = 'properties.ticks.';

    return (
      <div>
        <div className="property-group">
          <h3>Axis</h3>

          <Property name="orient" label="Orient" type="select"
            opts={orientOpts} onChange={handleChange} {...props} />

          <MoreProperties label="Axis">
            <Property name={axis + 'stroke'} label="Color" type="color" {...props} />

            <Property name={axis + 'strokeWidth'} label="Width" type="range"
              min="0" max="10" step="0.25" {...props} />
          </MoreProperties>
        </div>

        <div className="property-group">
          <h3>Title</h3>

          <Property name="title" label="Text" type="text"
            onChange={handleChange} {...props} />

          <Property name={title + 'fontSize'} label="Font Size" type="number" {...props} />

          <MoreProperties label="Title">
            <Property name={title + 'fill'} label="Color" type="color" {...props} />

            <Property name="titleOffset" label="Offset" type="number"
              onChange={handleChange} {...props} />
          </MoreProperties>
        </div>

        <div className="property-group">
          <h3>Labels</h3>

          <Property name={labels + 'fontSize'} label="Font Size" type="number" {...props} />

          <Property name={labels + 'angle'} label="Angle" type="number"
            min="0" max="360" {...props} />

          <MoreProperties label="Label">
            <Property name={labels + 'fill'} label="Fill" type="color" {...props} />
          </MoreProperties>
        </div>

        <div className="property-group">
          <h3>Grid</h3>

          <Property name="grid" label="Grid" type="checkbox"
            onChange={handleChange} {...props}/>

          <Property name="layer" label="Layer" type="select" opts={layerOpts}
            onChange={handleChange} {...props} />

          <MoreProperties label="Grid">
            <Property name={grid + 'stroke'} label="Color" type="color" {...props} />

            <Property name={grid + 'strokeOpacity'} label="Opacity" type="range"
              min="0" max="1" step="0.05" {...props} />

            <Property name={grid + 'strokeWidth'} label="Width" type="range"
              min="0" max="10" step="0.25" {...props} />
          </MoreProperties>
        </div>

        <div className="property-group last">
          <MoreProperties label="Ticks" header="true">
            <Property name="ticks" label="Number of Ticks" type="number"
              onChange={handleChange} {...props} />

            <Property name={ticks + 'stroke'} label="Color" type="color" {...props} />

            <Property name={ticks + 'strokeWidth'} label="Width" type="range"
              min="0" max="10" step="0.25" {...props} />

            <Property name="tickPadding" label="Padding" type="range"
              onChange={handleChange} {...props} />

            <Property name="tickSize" label="Size" type="number"
              onChange={handleChange} {...props} />
          </MoreProperties>
        </div>
      </div>
    );
  }
});

module.exports = AxisInspector;
