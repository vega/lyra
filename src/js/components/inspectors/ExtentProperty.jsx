var dl = require('datalib'),
    React = require('react'),
    Property = require('./Property.jsx'),
    SpatialPreset = require('./SpatialPreset.jsx'),
    util = require('../../util'),
    model  = require('../../model'),
    lookup = model.primitive;

var EXTENTS = {
  x: {
    start:  {name: 'x', label: 'Start'}, 
    center: {name: 'xc', label: 'Center'},
    span: {name: 'width', label: 'Width'},
    end:  {name: 'x2', label: 'End'}
  },
  y: {
    start:  {name: 'y', label: 'Start'}, 
    center: {name: 'yc', label: 'Center'},
    span: {name: 'height', label: 'Height'},
    end:  {name: 'y2', label: 'End'}
  }
};

var ExtentProperty = React.createClass({
  getInitialState: function() {
    return this.extents();
  },

  componentWillReceiveProps: function() {
    this.setState(this.extents());
  },

  reparse: function(_) {
    var component = this,
        state = _ || this.extents(),
        primitive = this.props.primitive;

    model.parse().then(function() {
      component.setState(state);
      require('../').select(primitive._id);
    });
  },

  extents: function() {
    var props = this.props,
        type  = props.type,
        primitive = props.primitive,
        update  = primitive.properties.update,
        extents = dl.vals(EXTENTS[type]),
        start, end, i, len;

    extents.forEach(function(x) {
      var name = x.name, prop = update[name];
      if (prop._disabled) return;
      else if (!start) start = name;
      else if (start !== name) end = name;
    });

    return {start: start, end: end};
  },

  handleChange: function(evt) {
    var props = this.props,
        state = this.state,
        type  = props.type,
        primitive = props.primitive,
        update = primitive.properties.update,
        target = evt.target,
        name   = target.name,
        value  = target.value,
        extents = EXTENTS[type],
        center  = extents.center.name,
        span = extents.span.name,
        old  = state[name];

    update[old]._disabled = true;
    update[value]._disabled = false;
    state[name] = value;

    if (value === center && state.end !== span) {
      update[state.end]._disabled = true;
      update[span]._disabled = false;
      state.end = span;
    }

    this.reparse(state);
  },

  render: function() {
    var state = this.state,
        props = this.props,
        type  = props.type,
        primitive = props.primitive,
        update  = primitive.properties.update,
        extents = EXTENTS[type],
        center = extents.center.name,
        opts  = dl.vals(extents),
        start = state.start, end = state.end;

    return (
      <div>

        <Property name="start" type="number" canDrop={true}
          scale={update[start].scale} field={update[start].field}
          signal={update[start].signal} disabled={update[start].band||update[start].group}>

          <div className="label">
            <select name="start" value={start} onChange={this.handleChange}>
              {opts.filter(function(x) { return x.name !== end; })
                .map(function(x) {
                  return (<option key={x.name} value={x.name}>{x.label}</option>)
                })}
            </select>
          </div>

          <SpatialPreset className="extra" name={start} reparse={this.reparse} {...props} />
        </Property>

        <Property name="end" type="number" canDrop={true}
          scale={update[end].scale} field={update[end].field}
          signal={update[end].signal} disabled={update[end].band||update[end].group}>

          <div className="label">
            {start === center ?
              (<label htmlFor="end">Width</label>) :
              (
                <select name="end" value={end} onChange={this.handleChange}>
                  {opts
                    .filter(function(x) { return x.name !== start && x.name != center; })
                    .map(function(x) {
                      return (<option key={x.name} value={x.name}>{x.label}</option>)
                    })}
                </select>
              )
            }
          </div>

          <SpatialPreset className="extra" name={end} reparse={this.reparse} {...props} />
        </Property>
      </div>
    )
  }
});

module.exports = ExtentProperty;