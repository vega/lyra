'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    ctrl = require('../../ctrl'),
    sg = require('../../ctrl/signals'),
    dsUtil = require('../../util/dataset-utils'),
    bindChannel = require('../../actions/bindChannel'),
    FieldType = require('./FieldType'),
    SortField = require('./SortField'),
    Icon = require('../Icon'),
    assets = require('../../util/assets');

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
    dsId: React.PropTypes.number,
    className: React.PropTypes.string.isRequired,
    def: React.PropTypes.object,
    schema: React.PropTypes.object
  },

  getInitialState: function() {
    return {
      fieldDef:  null,
      offsetTop: null,
      bindField: null,
      showFieldTransforms: false
    };
  },

  componentWillReceiveProps: function(newProps) {
    var def = newProps.def,
        schema = newProps.schema;

    if (!def) {
      this.setState({fieldDef: null});
    } else {
      this.setState({
        fieldDef: schema[def.name],
        offsetTop: def.offsetTop,
        showFieldTransforms: false
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

  toggleTransforms: function(evt) {

    this.setState({
      showFieldTransforms: !this.state.showFieldTransforms
    });
  },

  render: function() {
    var state = this.state,
        field = state.fieldDef,
        style = {top: state.offsetTop, display: field ? 'block' : 'none'};

    // Icon using temporary asset
    var transformsIcon = (<Icon onClick={this.toggleTransforms}
      glyph={assets.symbol} width="10" height="10" />),
        transformsList = state.showFieldTransforms ? (
          <div className="transforms-menu">
            <ul className="transforms-list">
              <li className="transform-item">
                Mean - {field.name}
              </li>
              <li className="transform-item">
                SD - {field.name}
              </li>
              <li className="transform-item-enum">
                + More transformations
              </li>
            </ul>
          </div>
        ) : null;

    field = field ? (
      <div>
        <div>
          <FieldType field={field} />
          {transformsIcon}
          {field.name}
          <SortField dsId={this.props.dsId} field={field} />
        </div>
        <div>
          {transformsList}
        </div>
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
