var React = require('react'),
    Parse = require('../mixins/Parse.jsx'),
    util = require('../../util'),
    model = require('../../model'),
    lookup = model.primitive;

var SpatialPreset = React.createClass({
  mixins: [Parse],

  handleChange: function(evt) {
    var props = this.props,
        primitive = props.primitive,
        target = evt.target,
        name = target.name,
        update = primitive.properties.update,
        prop = update[name],
        scale = prop.scale && lookup(prop.scale),
        preset = name.indexOf('x') >= 0 ? 'width' : 'height';

    if (evt.target.checked) {
      update[name] = (name === 'width' || name === 'height') ?
        {scale: prop.scale, band: true} : {group: preset};
    } else {
      update[name] = {signal: util.propSg(primitive, name)};
    }

    this.parse(primitive);
  },

  render: function() {
    var props = this.props,
        name = props.name,
        primitive = this.props.primitive,
        update = primitive.properties.update,
        prop = update[name],
        scale = prop.scale && lookup(prop.scale),
        preset = name.indexOf('x') >= 0 ? 'Width' : 'Height';

    if (prop.field) return null;

    if (name === 'width' || name === 'height') {
      return (scale && scale.type === 'ordinal' && !scale.points) ? (
        <label>
          <input type="checkbox" name={name} checked={prop.band}
            onChange={this.handleChange} /> Automatic
        </label>
      ) : null;
    } else {
      return (
        <label>
          <input type="checkbox" name={name} checked={prop.group}
            onChange={this.handleChange} /> Group {preset}
        </label>
      );
    }
  }
});

module.exports = SpatialPreset;
