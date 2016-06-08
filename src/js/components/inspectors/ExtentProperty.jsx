'use strict';
var dl = require('datalib'),
    React = require('react'),
    Property = require('./Property'),
    SpatialPreset = require('./SpatialPreset'),
    addVegaReparseRequest = require('../mixins/addVegaReparseRequest');

var EXTENTS = {
  x: {
    start: {name: 'x', label: 'Left'},
    center: {name: 'xc', label: 'Center'},
    span: {name: 'width', label: 'Width'},
    end: {name: 'x2', label: 'Right'}
  },
  y: {
    start: {name: 'y', label: 'Top'},
    center: {name: 'yc', label: 'Middle'},
    span: {name: 'height', label: 'Height'},
    end: {name: 'y2', label: 'Bottom'}
  }
};

var ExtentProperty = React.createClass({

  componentWillReceiveProps: function() {
    this.setState(this.extents());
  },

  extents: function() {
    var props = this.props,
        type = props.type,
        primitive = props.primitive,
        update = primitive.properties.toObject().update.toObject(),
        extents = dl.vals(EXTENTS[type]),
        start, end;

    extents.forEach(function(x) {
      var name = x.name,
          prop = update[name].toObject();
      if (prop._disabled) {
        return;
      } else if (!start) {
        start = name;
      } else if (start !== name) {
        end = name;
      }
    });

    return {start: start, end: end};
  },

  handleChange: function(evt) {
    var props = this.props,
        state = this.extents(),
        type = props.type,
        primitive = props.primitive,
        update = primitive.properties.toObject().update.toObject(),
        target = evt.target,
        name = target.name,
        value = target.value,
        extents = EXTENTS[type],
        center = extents.center.name,
        span = extents.span.name,
        old = state[name];

    update[old]._disabled = true;
    update[value]._disabled = false;
    state[name] = value;

    if (value === center && state.end !== span) {
      update[state.end]._disabled = true;
      update[span]._disabled = false;
      state.end = span;
    }

    this.requestVegaReparse();
  },

  render: function() {
    var state = this.extents(),
        props = this.props,
        type = props.type,
        primitive = props.primitive,
        update = primitive.properties.toObject().update.toObject(),
        extents = EXTENTS[type],
        center = extents.center.name,
        span = extents.span.label,
        opts = dl.vals(extents),
        start = state.start,
        end = state.end;

    return (
      <div>
        <Property name={start}
          type="number"
          primitive={primitive}
          canDrop={true}
          firstChild={true}
          disabled={update[start].band || update[start].group}>

          <div className="label-long label">
            <select name="start" value={start} onChange={this.handleChange}>
              {opts
                .filter(function(x) {
                  return x.name !== end;
                })
                .map(function(x) {
                  return (<option key={x.name} value={x.name}>{x.label}</option>);
                })}
            </select>
          </div>

          <SpatialPreset className="extra" name={start} {...props} />
        </Property>

        <Property name={end}
          type="number"
          primitive={primitive}
          canDrop={true}
          firstChild={true}
          disabled={update[end].band || update[end].group}>

          <br />

          <div className="label-long label">
            {start === center ?
              (<label htmlFor="end">{span}</label>) :
              (
                <select name="end" value={end} onChange={this.handleChange}>
                  {opts
                    .filter(function(x) {
                      return x.name !== start && x.name !== center;
                    })
                    .map(function(x) {
                      return (<option key={x.name} value={x.name}>{x.label}</option>);
                    })}
                </select>
              )
            }
          </div>

          <SpatialPreset className="extra" name={end} {...props} />
        </Property>
      </div>
    );
  }
});

module.exports = addVegaReparseRequest(ExtentProperty);
