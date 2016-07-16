'use strict';
var d3 = require('d3'),
    dl = require('datalib'),
    React = require('react'),
    ReactDOM = require('react-dom'),
    connect = require('react-redux').connect,
    Immutable = require('immutable'),
    ctrl = require('../../ctrl'),
    addVegaReparseRequest = require('../mixins/addVegaReparseRequest'),
    sg = require('../../ctrl/signals'),
    getInVis = require('../../util/immutable-utils').getInVis,
    dsUtil = require('../../util/dataset-utils'),
    assets = require('../../util/assets'),
    Icon = require('../Icon'),
    bindChannel = require('../../actions/bindChannel');

function mapStateToProps(state, ownProps) {
  return {
    dataset: getInVis(state, 'datasets.' + ownProps.id)
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    bindChannel: function(dsId, field, markId, property) {
      dispatch(bindChannel(dsId, field, markId, property));
    }
  };
}

var DataTable = React.createClass({
  propTypes: {
    id: React.PropTypes.number,
    dataset: React.PropTypes.instanceOf(Immutable.Map),
    bindChannel: React.PropTypes.func
  },

  getInitialState: function() {
    return {
      limit: 20,
      page: 0,
      fullField: null,
      fullValue: null,
      bindField: null
    };
  },

  componentDidMount: function() {
    var el = this._el = d3.select(ReactDOM.findDOMNode(this));

    this.$table = el.select('.datatable');
    this.$fullField = el.select('.full.field');
    this.$fullValue = el.select('.full.value');
  },

  prevPage: function() {
    var node = this.$table.node();
    this.setState({page: --this.state.page});
    node.scrollLeft = 0;
  },

  nextPage: function() {
    var node = this.$table.node();
    this.setState({page: ++this.state.page});
    node.scrollLeft = 0;
  },

  showFullField: function(evt) {
    var target = evt.target,
        name = target.textContent,
        schema = dsUtil.schema(this.props.id);

    this.hideFull(evt);
    this.setState({fullField: schema[name]});
    this.$fullField.style('display', 'block')
      .style('top', target.offsetTop);
  },

  showFullValue: function(evt) {
    var target = d3.select(evt.target),
        node = target.node(),
        field = node.parentNode.firstChild,
        fieldRect = field.getBoundingClientRect(),
        table = this.$table.node(),
        left = field.offsetLeft + fieldRect.width;

    this.hideFull(evt);
    this.setState({fullValue: target.text()});
    this.$fullValue.classed('odd', target.classed('odd'))
      .classed('even', target.classed('even'))
      .style('display', 'block')
      .style('left', node.offsetLeft - table.scrollLeft + left)
      .style('top', field.offsetTop);
  },

  hideFull: function(evt) {
    this.setState({fullField: null, fullValue: null});
    this.$fullField.style('display', 'none');
    this.$fullValue.style('display', 'none');
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
        fullField  = this.state.fullField,
        mTypeIndex = MTYPES.indexOf(fullField.mtype);

    mTypeIndex = (mTypeIndex + 1) % MTYPES.length;
    fullField.mtype = MTYPES[mTypeIndex];

    this.setState({fullField: fullField});
  },

  render: function() {
    var state = this.state,
        props = this.props,
        page = state.page,
        limit = state.limit,
        start = page * limit,
        stop = start + limit,
        id = props.id,
        schema = dsUtil.schema(id),
        output = dsUtil.values(id),
        values = output.slice(start, stop),
        keys = dl.keys(schema),
        max = output.length,
        fmt = dl.format.auto.number(),
        fullField = state.fullField,
        fullValue = state.fullValue;

    var prev = page > 0 ? (
          <Icon glyph={assets.prev} width="10" height="10"
            onClick={this.prevPage}
          />
        ) : null,
        next = page + 1 < max / limit ? (
          <Icon glyph={assets.next} width="10" height="10"
            onClick={this.nextPage}
          />
        ) : null;

    fullField = fullField ? (
      <span>
        <Icon onClick={this.changeMType}
          glyph={assets[fullField.mtype]} width="10" height="10" /> {fullField.name}
      </span>
      ) : null;

    return (
      <div>
        <div className="datatable"
          onMouseLeave={this.hideFull} onScroll={this.hideFull}>
          <table><tbody>
            {keys.map(function(k) {
              return (
                <tr key={k}>
                  <td className={'field ' + props.className}
                    onMouseOver={this.showFullField}>{k}</td>
                  {values.map(function(v, i) {
                    return (
                      <td key={k + i} className={i % 2 ? 'even' : 'odd'}
                        onMouseOver={this.showFullValue}>{v[k]}</td>
                    );
                  }, this)}
                </tr>
              );
            }, this)}
          </tbody></table>

          <div className={'full field ' + props.className}
            draggable={true}
            onDragStart={this.handleDragStart}
            onDragOver={this.handleDragOver}
            onDragEnd={this.handleDragEnd}
            onDrop={this.handleDrop}>{fullField}</div>

          <div className="full value">{fullValue}</div>
        </div>

        <div className="paging">
          <span>{fmt(start + 1)}–{stop > max ? fmt(max) : fmt(stop)} of {fmt(max)}</span>
          <span className="pager">{prev} {next}</span>
        </div>
      </div>
    );
  }

});

module.exports = connect(mapStateToProps, mapDispatchToProps)(addVegaReparseRequest(DataTable));
