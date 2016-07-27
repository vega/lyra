'use strict';
var d3 = require('d3'),
    dl = require('datalib'),
    vl = require('vega-lite'),
    React = require('react'),
    ReactDOM = require('react-dom'),
    connect = require('react-redux').connect,
    Immutable = require('immutable'),
    ctrl = require('../../ctrl'),
    addVegaReparseRequest = require('../mixins/addVegaReparseRequest'),
    sg = require('../../ctrl/signals'),
    getIn = require('../../util/immutable-utils').getIn,
    dsUtil = require('../../util/dataset-utils'),
    assets = require('../../util/assets'),
    Icon = require('../Icon'),
    bindChannel = require('../../actions/bindChannel'),
    data = require('../../actions/bindChannel/parseData').data,
    store = require('../../store');

function mapStateToProps(state, ownProps) {
  return {
    dataset: getIn(state, 'datasets.' + ownProps.id)
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    bindChannel: function(dsId, field, markId, property) {
      dispatch(bindChannel(dsId, field, markId, property));
    }
  };
}

var FullField = React.createClass({

  getInitialState: function() {
    return {
      fullField: null,
      bindField: null,
      valuesInc: null
    };
  },

  hideFull: function(evt) {
    this.setState({fullField: null});
    this.$fullField.style('display', 'none');
    this.$fullValue.style('display', 'none');
  },

  handleDragStart: function(evt) {
    this.setState({bindField: this.props.fullField});
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
        props.bindChannel(props.id, bindField, sel.mark.def.lyra_id, cell.key);
      }
    } catch (e) {
      console.warn('Unable to bind primitive');
      console.warn(e);
    }

    sg.set(sg.MODE, 'handles');
    sg.set(sg.CELL, {});
    this.setState({bindField: null});

    if (dropped) {
      this.requestVegaReparse();
    } else {
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
        fullField  = this.props.fullField,
        mTypeIndex = MTYPES.indexOf(fullField.mtype);

    mTypeIndex = (mTypeIndex + 1) % MTYPES.length;
    fullField.mtype = MTYPES[mTypeIndex];

    this.setState({fullField: fullField});
  },

  sortValues: function(evt) {
    // will need to clean up this code
    var valuesInc = this.state.valuesInc,
        props = this.props,
        fullField = props.fullField,
        id = props.id,
        output = dsUtil.values(id),
        schema = dsUtil.schema(id),
        sel = sg.get(sg.SELECTED),
        markId = sel.mark.def.lyra_id,
        cell = sg.get(sg.CELL),
        property = cell.key;

    if (valuesInc == null) {
      // first click default: increasing
      valuesInc = true;
    } else {
      valuesInc = !valuesInc;
    }
    this.setState({ valuesInc : valuesInc });

    // bindchannel
    //store.dispatch(bindChannel(id, schema, markId, property));

    // custom action, need to make action creator for future
    store.dispatch({
      transform : 'SORT',
      inc : valuesInc,
      id : id,
      fieldName : fullField.name
    });

  },

  render : function() {

    var fullField = this.props.fullField;


    fullField = fullField ? (
      <span>
        <Icon onClick={this.changeMType}
          glyph={assets[fullField.mtype]} width="10" height="10" />
        {fullField.name}
        <Icon onClick={this.sortValues}
          glyph={assets['decreasingSort']} width="10" height="10" />
      </span>
      ) : null;

    return (
      <div className={'full field ' + this.props.className}
             draggable={true}
             onDragStart={this.handleDragStart}
             onDragOver={this.handleDragOver}
             onDragEnd={this.handleDragEnd}
             onDrop={this.handleDrop}>{fullField}</div>
    );
  }
});

module.exports = connect(mapStateToProps, mapDispatchToProps)(addVegaReparseRequest(FullField));
