'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    ctrl = require('../../ctrl'),
    sg = require('../../ctrl/signals'),
    dsUtil = require('../../util/dataset-utils'),
    bindChannel = require('../../actions/bindChannel'),
    FieldType = require('./FieldType');

function mapStateToProps(state, ownProps) {
  return {};
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    bindChannel: function(dsId, field, markId, property) {
      dispatch(bindChannel(dsId, field, markId, property));
    }
  };
}

var HoverField = React.createClass({
  propTypes: {
    dsId: React.PropTypes.number.isRequired,
    className: React.PropTypes.string.isRequired,
    def: React.PropTypes.object
  },

  getInitialState: function() {
    return {
      fieldDef:  null,
      offsetTop: null,
      bindField: null
    };
  },

  componentWillReceiveProps: function(newProps) {
    var def = newProps.def,
        schema = dsUtil.schema(newProps.dsId) || newProps.dsSchema;

    if (!def) {
      this.setState({fieldDef: null});
    } else {
      this.setState({
        fieldDef: schema[def.name],
        offsetTop: def.offsetTop
      });
    }
  },

  handleDragStart: function(evt) {
    this.setState({bindField: this.state.fieldDef});
    evt.dataTransfer.setData('text/plain', evt.target.id);
    evt.dataTransfer.effectAllowed = 'link';
    sg.set(sg.MODE, 'channels');
    ctrl.update();
  },

  handleDragOver: function(evt) {
    if (evt.preventDefault) {
      evt.preventDefault(); // Necessary. Allows us to drop.
    }

    return false;
  },

  // This makes use of the bubble cursor, which corresponds to the cell signal;
  // we're using that to figure out which channel we are closest to. The
  // SELECTED signal indicates the mark to bind the data to.
  handleDragEnd: function(evt) {
    var props = this.props,
        sel = sg.get(sg.SELECTED),
        cell = sg.get(sg.CELL),
        bindField = this.state.bindField,
        dropped = sel._id && cell._id;

    try {
      if (dropped) {
        props.bindChannel(props.dsId, bindField, sel.mark.def.lyra_id, cell.key);
      }
    } catch (e) {
      console.warn('Unable to bind primitive');
      console.warn(e);
    }

    sg.set(sg.MODE, 'handles');
    sg.set(sg.CELL, {});
    this.setState({bindField: null});

    if (!dropped) {
      ctrl.update();
    }
  },

  handleDrop: function(evt) {
    if (evt.preventDefault) {
      evt.preventDefault(); // Necessary. Allows us to drop.
    }

    return false;
  },

  changeMType: function(evt) {
    var MTYPES = dsUtil.MTYPES,
        fieldDef  = this.state.fieldDef,
        mTypeIndex = MTYPES.indexOf(fieldDef.mtype);

    mTypeIndex = (mTypeIndex + 1) % MTYPES.length;
    fieldDef.mtype = MTYPES[mTypeIndex];
    this.setState({fieldDef: fieldDef});
  },

  render: function() {
    var state = this.state,
        field = state.fieldDef,
        style = {top: state.offsetTop, display: field ? 'block' : 'none'};

    field = field ? (
      <div>
        <FieldType field={field} />
        {field.name}
      </div>
    ) : null;

    return (
      <div className={'full field ' + this.props.className}
        style={style} draggable={true}
        onDragStart={this.handleDragStart}
        onDragOver={this.handleDragOver}
        onDragEnd={this.handleDragEnd}
        onDrop={this.handleDrop}>{field}</div>
    );
  }
});

module.exports = connect(mapStateToProps, mapDispatchToProps)(HoverField);
