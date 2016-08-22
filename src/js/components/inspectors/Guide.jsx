'use strict';

var React = require('react'),
    connect = require('react-redux').connect,
    dl = require('datalib'),
    GTYPES = require('../../store/factory/Guide').GTYPES,
    updateGuideProperty = require('../../actions/guideActions').updateGuideProperty,
    AxisInspector = require('./Axis'),
    LegendInspector = require('./Legend');

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
    primId: React.PropTypes.number,
    guideType: React.PropTypes.oneOf(dl.vals(GTYPES)),
    updateGuideProperty: React.PropTypes.func
  },

  handleChange: function(evt) {
    var guideId = this.props.primId,
        target  = evt.target,
        property = target.name,
        value = (target.type === 'checkbox') ? target.checked :
                target.value;

    // Parse number or keep string around.
    value = value === '' || isNaN(+value) ? value : +value;
    this.props.updateGuideProperty(guideId, property, value);
  },

  render: function() {
    var props = this.props,
        guideType = props.guideType;

    if (guideType === GTYPES.AXIS) {
      return (<AxisInspector {...props} handleChange={this.handleChange} />);
    } else if (guideType === GTYPES.LEGEND) {
      return (<LegendInspector {...props} handleChange={this.handleChange} />);
    }

    return null;
  }
});

module.exports = connect(mapStateToProps, mapDispatchToProps)(GuideInspector);
