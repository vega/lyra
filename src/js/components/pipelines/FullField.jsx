'use strict'
var d3 = require('d3'),
    dl = require('datalib'),
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
    bindChannel = require('../../actions/bindChannel');

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

    propTypes: {
      id: React.PropTypes.number,
      dataset: React.PropTypes.instanceOf(Immutable.Map),
      bindChannel: React.PropTypes.func
    },

    getInitialState: function() {
      return {
        fullField : this.props.data,
        bindField : null
      };
    },

    componentDidMount: function() {
      var el = this._el = d3.select(ReactDOM.findDOMNode(this));

      this.$table = el.select('.datatable');
      this.$fullField = el.select('.full.field');
    },

    hideFull: function(evt) {
        this.setState({
            name : null,
            type : null,
            mtype: null
        });
      this.$fullField.style('display', 'none');
    },

    handleDragStart: function(evt) {
      this.setState({bindField: this.state.fullField});
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

    //**** WORK ON THIS ********
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
          mtype  = this.state.mtype,
          mTypeIndex = MTYPES.indexOf(mtype);

      mTypeIndex = (mTypeIndex + 1) % MTYPES.length;
      mtype = MTYPES[mTypeIndex];

      this.setState({mtype: mtype});
    },

    render : function() {
        var fullField = this.state.fullField,
            fullField = fullField ? (
              <span>
                <Icon onClick={this.changeMType}
                  glyph={assets[fullField.mtype]} width="10" height="10" /> {fullField.name}
              </span>
              ) : null;

        return (
            <div>
                <div className={'full field ' + this.props.className}
                  draggable={true}
                  onDragStart={this.handleDragStart}
                  onDragOver={this.handleDragOver}
                  onDragEnd={this.handleDragEnd}
                  onDrop={this.handleDrop}>{fullField}</div>
            </div>
        );
    }

});

module.exports = connect(mapStateToProps, mapDispatchToProps)(addVegaReparseRequest(FullField));
