'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    getInVis = require('../../util/immutable-utils').getInVis,
    Property = require('./Property'),
    MoreProperties = require('./MoreProperties'),
    primTypes = require('../../constants/primTypes'),
    SHAPES = require('../../store/factory/marks/Symbol').SHAPES,
    propTypes = require('prop-types'),
    createReactClass = require('create-react-class');

function mapStateToProps(reduxState, ownProps) {
  var guide = getInVis(reduxState, 'guides.' + ownProps.primId),
      type  = guide.get('_type'),
      scale = getInVis(reduxState, 'scales.' + guide.get(type));

  return {
    legendType: type,
    scaleType: scale.get('type')
  };
}

var LegendInspector = createReactClass({
  propTypes: {
    primId: propTypes.number.isRequired,
    primType: primTypes.isRequired,
    legendType: propTypes.string.isRequired,
    scaleType: propTypes.string.isRequired,
    handleChange: propTypes.func
  },

  render: function() {
    var props = this.props,
        handleChange = props.handleChange,
        legendType = props.legendType,
        scaleType = props.scaleType,
        orientOpts = ['left', 'right'],
        legend   = 'properties.legend.',
        title  = 'properties.title.',
        labels = 'properties.labels.',
        grad = 'properties.gradient.',
        symbols = 'properties.symbols.';

    var labelProperties = (
      <div className="property-group">
        <h3>Labels</h3>

        <Property name={labels + 'fontSize'} label="Font Size" type="number" {...props} />

        <MoreProperties label="Label">
          <Property name={labels + 'fill'} label="Fill" type="color" {...props} />
        </MoreProperties>
      </div>
    );

    return (
      <div>
        <div className="property-group">
          <h3>Legend</h3>

          <Property name="orient" label="Orient" type="select"
            opts={orientOpts} onChange={handleChange} {...props} />

          <MoreProperties label="Legend">
            <Property name={legend + 'stroke'} label="Color" type="color" {...props} />

            <Property name={legend + 'strokeWidth'} label="Width" type="range"
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
          </MoreProperties>
        </div>

        {(legendType === 'fill' || legendType === 'stroke') &&
            scaleType !== 'ordinal' ? (
          <div>
            {labelProperties}

            <div className="property-group">
              {/* <h3>Gradient</h3> */}

              {/* <Property name={grad + 'height'} label="Height" type="number" {...props} /> */}

              {/* <Property name={grad + 'width'} label="Width" type="number" {...props} /> */}

              <MoreProperties label="Gradient" header="true">
                <Property name={grad + 'stroke'} label="Color" type="color" {...props} />

                <Property name={grad + 'strokeWidth'} label="Width" type="range"
                  min="0" max="10" step="0.25" {...props} />
              </MoreProperties>
            </div>
          </div>
        ) : (
          <div>
            <div className="property-group">
              <h3>Symbols</h3>

              {legendType !== 'shape' ? (
                <Property name={symbols + 'shape'} label="Shape"
                  type="select" opts={SHAPES} {...props} />
              ) : null}

              {legendType !== 'size' ? (
                <Property name={symbols + 'size'} label="Size" type="number" {...props} />
              ) : null}

              {legendType !== 'fill' ? (
                <Property name={symbols + 'fill'} label="Fill" type="color" {...props} />
              ) : null}

              {legendType !== 'stroke' ? (
                <Property name={symbols + 'stroke'} label="Stroke" type="color" {...props} />
              ) : null}

              <MoreProperties label="Symbol">
                <Property name={symbols + 'fillOpacity'} label="Opacity"
                  type="range" min="0" max="1" step="0.05" {...props} />

                <Property name={symbols + 'strokeWidth'} label="Width"
                  type="range" min="0" max="10" step="0.25" {...props} />
              </MoreProperties>
            </div>

            {labelProperties}
          </div>
        )}
      </div>
    );
  }
});

module.exports = connect(mapStateToProps)(LegendInspector);
