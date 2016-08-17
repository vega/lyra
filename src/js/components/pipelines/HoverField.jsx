'use strict';

var React = require('react'),
    connect = require('react-redux').connect,
    dsUtil = require('../../util/dataset-utils'),
    bindChannel = require('../../actions/bindChannel'),
    FieldType = require('./FieldType'),
    SortField = require('./SortField'),
    sg = require('../../ctrl/signals'),
    ctrl = require('../../ctrl'),
    Icon = require('../Icon'),
    AggregateField = require('./AggregateField'),
    assets = require('../../util/assets'),
    AGGREGATION_OPS = require('../../constants/transformTypes').aggregationOps;

var LIST_LIMIT = 5;

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

  // mixins: [DraggableFields],

  getInitialState: function() {
    return {
      fieldDef:  null,
      offsetTop: null,
      bindField: null,
      showFieldTransforms: false,
      listLimit: LIST_LIMIT
    };
  },

  // need to modify in a way that preserves the old props if new ones
  // aren't detected, if the user drags an AggregationField out of the transforms
  // menue the information that the DraggableFields mixins is gone
  componentWillReceiveProps: function(newProps) {
    var def = newProps.def,
        schema = dsUtil.schema(newProps.dsId) || newProps.dsSchema,
        state = {
          listLimit: LIST_LIMIT,
          showFieldTransforms: false
        };

    if (!def) {
      state.fieldDef = null;
    } else {
      state.fieldDef = schema[def.name];
      state.offsetTop = def.offsetTop;
    }

    this.setState(state);
  },

  handleDragStart: function(evt) {
    var state = {
      bindField: this.state.fieldDef
    };

    // if an AggregateField isn't being dragged, close the menu
    // and reset listLimit
    if (!evt.target.classList.contains('aggregate-field')) {
      state.showFieldTransforms = false;
      state.listLimit = LIST_LIMIT;
    }

    this.setState(state);
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
  expandTransformsList: function() {
    this.setState({
      listLimit: AGGREGATION_OPS.length
    });
  },
  collapseTransformsList: function() {
    this.setState({
      listLimit: LIST_LIMIT
    });
  },

  // TODO generalize MoreProperties styling instead of rewriting all dynamic list code
  // TODO move transformations list from HoverField to own component
  render: function() {
    var state = this.state,
        field = state.fieldDef,
        style = {top: state.offsetTop, display: field ? 'block' : 'none'},
        transforms = AGGREGATION_OPS.slice(0, state.listLimit),
        aggregateFieldProps = {
          onDragStart: this.handleDragStart,
          onDragOver: this.handleDragOver,
          onDragEnd: this.handleDragEnd,
          onDrop: this.handleDrop
        };

    // Icon use temporary asset
    var transformsIcon = (<Icon onClick={this.toggleTransforms} glyph={assets.symbol}
      width="10" height="10" />);

    var listControls = AGGREGATION_OPS.length > state.listLimit ?
      (<li className="transform-item-enum"
        onClick={this.expandTransformsList}>
          <strong>+ More Transforms</strong>
        </li>) : (<li className="transform-item-enum"
          onClick={this.collapseTransformsList}>
            <strong>+ Fewer Transforms</strong>
          </li>);

    var transformsList = state.showFieldTransforms ? (
          <div className="transforms-menu">
            <ul className="transforms-list">
              {listControls}
              {
                transforms.map(function(transform, i) {
                  return (
                    <li className="transform-item" key={i}>
                      <AggregateField aggregationName={transform}
                        field={field.name}
                        {...aggregateFieldProps} />
                    </li>
                  );
                }, this)
              }
              <li className="transform-item-enum"
                onClick={this.toggleTransforms}>
                <strong className="close-transforms">Dismiss</strong>
              </li>
            </ul>
          </div>
        ) : null;

    field = field ? (
      <div>
        <FieldType field={field} />
        {transformsIcon}
        {field.name}
        <SortField dsId={this.props.dsId} field={field} />
        {transformsList}
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
