'use strict';

var React = require('react'),
    connect = require('react-redux').connect,
    dl = require('datalib'),
    ReactTooltip = require('react-tooltip'),
    ctrl = require('../../ctrl'),
    sg = require('../../ctrl/signals'),
    bindChannel = require('../../actions/bindChannel'),
    Icon = require('../Icon'),
    FieldType = require('./FieldType'),
    SortField = require('./transforms/SortIcon'),
    FilterField = require('./transforms/FilterIcon').connected,
    FormulaField = require('./transforms/FormulaIcon').connected,
    AggregateList = require('./AggregateList'),
    getInVis = require('../../util/immutable-utils').getInVis,
    assets = require('../../util/assets'),
    QUANTITATIVE = require('../../constants/measureTypes').QUANTITATIVE;

function mapStateToProps(state, ownProps) {
  return {
    srcId: getInVis(state, 'pipelines.' +
      getInVis(state, 'datasets.' + ownProps.dsId + '._parent') + '._source')
  };
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
    srcId: React.PropTypes.number,
    def: React.PropTypes.object,
    schema: React.PropTypes.object
  },

  getInitialState: function() {
    return {
      fieldDef:  null,
      offsetTop: null,
      bindField: null,
      showAggregates: false,
    };
  },

  componentWillReceiveProps: function(newProps) {
    var def = newProps.def,
        schema = newProps.schema,
        state = {showAggregates: false};

    if (!def) {
      state.fieldDef = null;
    } else {
      state.fieldDef = schema[def.name];
      state.offsetTop = def.offsetTop;
    }

    this.setState(state);
  },

  componentDidUpdate: function() {
    ReactTooltip.rebuild();
  },

  handleDragStart: function(evt) {
    var state = {bindField: this.state.fieldDef};

    // if an AggregateField isn't being dragged, close the menu
    if (!evt.target.classList.contains('aggregate-field')) {
      state.showAggregates = false;
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
  handleDragEnd: function(evt, opts) {
    var props = this.props,
        sel = sg.get(sg.SELECTED),
        cell = sg.get(sg.CELL),
        bindField = this.state.bindField,
        dropped = sel._id && cell._id,
        dsId = bindField.source ? props.srcId : props.dsId;

    try {
      if (dropped) {
        dl.extend(bindField, opts); // Aggregate or Bin passed in opts.
        props.bindChannel(dsId, bindField, sel.mark.def.lyra_id, cell.key);
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
    this.setState({showAggregates: !this.state.showAggregates});
  },

  render: function() {
    var state = this.state,
        field = state.fieldDef,
        fieldStyle = {top: state.offsetTop, display: field ? 'block' : 'none'},
        listStyle  = {
          top: state.offsetTop,
          display: field && state.showAggregates ? 'block' : 'none'
        },
        dragHandlers = {
          onDragStart: this.handleDragStart,
          onDragOver: this.handleDragOver,
          onDragEnd: this.handleDragEnd,
          onDrop: this.handleDrop
        };

    var fieldEl = field ? (
      <div>
        <FieldType field={field} />
        {field.mtype === QUANTITATIVE ? (
          <Icon onClick={this.toggleTransforms} glyph={assets.aggregate}
            width="10" height="10" data-tip="Show aggregations" />
        ) : null}
        <span className="fieldName">{field.name}</span>
        <SortField dsId={this.props.dsId} field={field} />
        <FilterField dsId={this.props.dsId} field={field}/>
        <FormulaField dsId={this.props.dsId} field={field}/>
      </div>
    ) : null;

    return (
      <div>
        <div style={fieldStyle} draggable={true}
          className={'full field ' + (field && field.source ? 'source' : 'derived')}
          onDragStart={this.handleDragStart}
          onDragOver={this.handleDragOver}
          onDragEnd={this.handleDragEnd}
          onDrop={this.handleDrop}>{fieldEl}</div>

        <AggregateList handlers={dragHandlers} style={listStyle}
          field={field} {...this.props} />
      </div>
    );
  }
});

module.exports = connect(mapStateToProps, mapDispatchToProps)(HoverField);
