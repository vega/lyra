'use strict';
var dl = require('datalib'),
    React = require('react'),
    connect = require('react-redux').connect,
    Property = require('./Property'),
    reparse = require('../../actions/reparseModel');

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

function mapDispatchToProps(dispatch, ownProps) {
  return {
    reparse: function() {
      dispatch(reparse(true));
    }
  };
}

var AreaProperty = React.createClass({

  getInitialState: function() {
    return this.extents();
  },

  componentWillReceiveProps: function() {
    this.setState(this.extents());
  },

  extents: function() {
    var props = this.props,
        type = props.type,
        primitive = props.primitive,
        update = primitive.properties.update,
        extents = dl.vals(EXTENTS[type]),
        start, end;

    extents.forEach(function(x) {
      var name = x.name,
          prop = update[name];

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
        state = this.state,
        type = props.type,
        primitive = props.primitive,
        update = primitive.properties.update,
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

    this.props.reparse();
  },

  render: function() {
    var state = this.state,
        props = this.props,
        primitive = props.primitive,
        update = primitive.properties.update,
        start = state.start, end = state.end;

    return (
      <div>
        <Property
          name={start}
          type="number"
          primitive={primitive}
          canDrop={true}
          scale={update[start].scale}
          field={update[start].field}
          signal={update[start].signal}
          disabled={update[start].band || update[start].group}
          >
          <div className="label">
            Start
          </div>
        </Property>

        <Property
          name={end}
          type="number"
          primitive={primitive}
          canDrop={true}
          scale={update[end].scale}
          field={update[end].field}
          signal={update[end].signal}
          disabled={update[end].band || update[end].group}
          >
          <div className="label">
            End
          </div>
        </Property>
      </div>
    );
  }
});

module.exports = connect(function() {}, mapDispatchToProps)(AreaProperty);
