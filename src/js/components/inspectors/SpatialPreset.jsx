'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    Immutable = require('immutable'),
    getInVis = require('../../util/immutable-utils').getInVis,
    markActions = require('../../actions/markActions'),
    setMarkVisual = markActions.setMarkVisual,
    resetMarkVisual = markActions.resetMarkVisual;

function mapStateToProps(state, ownProps) {
  var id = ownProps.primId,
      propName = ownProps.name,
      prop = getInVis(state, 'marks.' + id + '.properties.update.' + propName);

  return {
    field: prop.get('field'),
    band:  prop.get('band'),
    group: prop.get('group'),
    scale: getInVis(state, 'scales.' + prop.get('scale'))
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  var id = ownProps.primId;
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
    field: React.PropTypes.string,
    band: React.PropTypes.bool,
    group: React.PropTypes.string,
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
  },

  render: function() {
    var props = this.props,
        name  = props.name,
        scale = props.scale,
        preset = name.indexOf('x') >= 0 ? 'width' : 'height';

    if (props.field) {
      return null;
    }

    if (name === 'width' || name === 'height') {
      return (scale && scale.get('type') === 'ordinal' && !scale.get('points')) ? (
        <label>
          <input type="checkbox" name={name} checked={props.band}
            onChange={this.handleChange} /> Automatic
        </label>
      ) : null;
    }

    return (
      <label>
        <input type="checkbox" name={name} checked={props.group}
          onChange={this.handleChange} /> Set to group {preset}
      </label>
    );
  }
});

module.exports = connect(mapStateToProps, mapDispatchToProps)(SpatialPreset);
