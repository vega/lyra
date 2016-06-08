'use strict';
var React = require('react'),
    propSg = require('../../util/prop-signal'),
    model = require('../../model'),
    lookup = model.lookup,
    addVegaReparseRequest = require('../mixins/addVegaReparseRequest');

var SpatialPreset = React.createClass({
  propTypes: {
    primitive: React.PropTypes.object
  },

  handleChange: function(evt) {
    var props = this.props,
        primitive = props.primitive,
        target = evt.target,
        name = target.name,
        update = primitive.properties.toObject().update.toObject(),
        prop = update[name],
        scale = prop.scale && lookup(prop.scale),
        preset = name.indexOf('x') >= 0 ? 'width' : 'height';

    if (evt.target.checked) {
      update[name] = (name === 'width' || name === 'height') ? {
        scale: scale,
        band: true
      } : {
        group: preset
      };
    } else {
      update[name] = {
        signal: propSg(primitive, name)
      };
    }

    this.requestVegaReparse();
  },

  render: function() {
    var props = this.props,
        name = props.name,
        primitive = this.props.primitive,
        update = primitive.properties.toObject().update.toObject(),
        prop = update[name],
        scale = prop.scale && lookup(prop.scale),
        preset = name.indexOf('x') >= 0 ? 'width' : 'height';

    if (prop.field) {
      return null;
    }

    if (name === 'width' || name === 'height') {
      return (scale && scale.type === 'ordinal' && !scale.points) ? (
        <label>
          <input type="checkbox" name={name} checked={prop.band}
            onChange={this.handleChange} /> Automatic
        </label>
      ) : null;
    }

    return (
      <label>
        <input type="checkbox" name={name} checked={prop.group}
          onChange={this.handleChange} /> Set to group {preset}
      </label>
    );
  }
});

module.exports = addVegaReparseRequest(SpatialPreset);
