'use strict';

var React = require('react'),
    Immutable = require('immutable'),
    connect = require('react-redux').connect,
    imutils = require('../../util/immutable-utils'),
    getInVis = require('../../util/immutable-utils').getInVis,
    getIn = imutils.getIn,
    Property = require('./Property'),
    updateScaleProperty = require('../../actions/scaleActions').updateScaleProperty,
    primTypes = require('../../constants/primTypes');

var SCALE_TYPE = ['linear', 'ordinal', 'time', 'utc', 'log', 'pow', 'sqrt', 'quantile', 'quantize', 'threshold'],
    NICE_TIME = ['second', 'minute', 'hour', 'day', 'week', 'month', 'year'];

function mapStateToProps(state, ownProps) {
  return {
    scale: getInVis(state, 'scales.' + ownProps.primId)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    updateScaleProperty: function(scaleId, property, value) {
      dispatch(updateScaleProperty(scaleId, property, value));
    }
  }
}

var ScaleInspector = React.createClass({
  propTypes: {
    primId: React.PropTypes.number.isRequired,
    primType: primTypes.isRequired,
    scale: React.PropTypes.instanceOf(Immutable.Map)
  },


  handleChange: function(prop, evt) {
    var scale = this.props.scale,
        points = getIn(scale, 'points'),
        value = evt.target.value || '';

    if (prop === 'padding' || prop === 'exponent') {
      value = +value;
    } else if (prop === 'points') {
      value = !points;
    }

    this.props.updateScaleProperty(this.props.primId, prop, value);
  },

  // getInitialState: function() {
  //   var type = this.props.scale.type,
  //       time = false;
  //   if (type === 'time' || type === 'utc') {
  //     time = true;
  //   }
  //   return {time: time};
  // },

  render: function() {
    var scale = this.props.scale,
        points = getIn(scale, 'points'),
        padding = getIn(scale, 'padding'),
        type = getIn(scale, 'type');

    var typeSelections = (<Property lable="Type" type="select" name="type" opts={SCALE_TYPE} onChange={this.handleChange.bind(this, 'type')} />),
        scaleTypes;

        if (type === 'ordinal') {
          scaleTypes = (
            <div>
              {typeSelections}
              <Property name="points" id="points" label="Points" type="checkbox" value={points} onChange={this.handleChange.bind(this, 'points')} />
              <Property name="padding" label="Padding" type="range" min="0" max="1" step="0.1" value={padding} onChange={this.handleChange.bind(this, 'padding')} />
            </div>
          );
        }
   

    return (
      <div>
        <div className="property-group">
          <h3 className="label">Scale</h3>
          <Property name="name" label="Name" type="text" onChange={this.handleChange.bind(this, 'name')} />
        </div>

        <div className="property-group">
          <h3 className="label">Type</h3>
            {scaleTypes}
        </div>
      </div>
    );
  }
});

module.exports = connect(mapStateToProps, mapDispatchToProps)(ScaleInspector);
