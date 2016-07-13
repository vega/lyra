'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    Immutable = require('immutable'),
    addVegaReparseRequest = require('../mixins/addVegaReparseRequest'),
    getInVis = require('../../util/immutable-utils').getInVis,
    markActions = require('../../actions/markActions'),
    setMarkVisual = markActions.setMarkVisual,
    resetMarkVisual = markActions.resetMarkVisual;

function mapStateToProps(reduxState, ownProps) {
  var prim = ownProps.primitive,
      name = ownProps.name,
      update = prim.properties.update,
      prop = update[name];

  return {
    property: update[name],
    scale: getInVis(reduxState, 'scales.' + prop.scale)
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  var id = ownProps.primitive._id;
  return {
    setPreset: function(name, def) {
      dispatch(setMarkVisual(id, name, def));
    },
    reset: function(name) {
      dispatch(resetMarkVisual(id, name));
    }
  };
}

var SpatialPreset = React.createClass({
  propTypes: {
    primitive: React.PropTypes.object,
    property: React.PropTypes.object,
    scale: React.PropTypes.instanceOf(Immutable.Map)
  },

  handleChange: function(evt) {
    var props = this.props,
        name  = props.name,
        scale = props.scale,
        preset = name.indexOf('x') >= 0 ? 'width' : 'height';

    if (evt.target.checked) {
      props.setPreset(name, (name === 'width' || name === 'height') ? {
        scale: scale.get('_id'),
        band: true
      } : {
        group: preset
      });
    } else {
      props.reset(name);
    }

    this.requestVegaReparse();
  },

  render: function() {
    var props = this.props,
        name  = props.name,
        scale = props.scale,
        property = props.property,
        preset = name.indexOf('x') >= 0 ? 'width' : 'height';

    if (property.field) {
      return null;
    }

    if (name === 'width' || name === 'height') {
      return (scale && scale.get('type') === 'ordinal' && !scale.get('points')) ? (
        <label>
          <input type="checkbox" name={name} checked={property.band}
            onChange={this.handleChange} /> Automatic
        </label>
      ) : null;
    }

    return (
      <label>
        <input type="checkbox" name={name} checked={property.group}
          onChange={this.handleChange} /> Set to group {preset}
      </label>
    );
  }
});

module.exports = connect(mapStateToProps, mapDispatchToProps)(addVegaReparseRequest(SpatialPreset));
