'use strict';
var d3 = require('d3'),
    dl = require('datalib'),
    React = require('react'),
    ReactDOM = require('react-dom'),
    model = require('../../model'),
    lookup = model.lookup,
    addVegaReparseRequest = require('../mixins/addVegaReparseRequest'),
    sg = require('../../model/signals');

var DataTable = React.createClass({
  propTypes: {
    dataset: React.PropTypes.object,
    'dataset.schema': React.PropTypes.object
  },

  getInitialState: function() {
    return {
      limit: 20,
      page: 0,
      fullField: null,
      fullValue: null
    };
  },

  componentDidMount: function() {
    var el = this._el = d3.select(ReactDOM.findDOMNode(this));

    this._table = el.select('.datatable');
    this._fullField = el.select('.full.field');
    this._fullValue = el.select('.full.value');
  },

  prevPage: function() {
    var node = this._table.node();
    this.setState({page: --this.state.page});
    node.scrollLeft = 0;
  },

  nextPage: function() {
    var node = this._table.node();
    this.setState({page: ++this.state.page});
    node.scrollLeft = 0;
  },

  showFullField: function(evt) {
    var target = evt.target,
        name = target.textContent,
        schema = this.props.dataset.schema();

    this.hideFull(evt);
    this.setState({fullField: schema[name]});
    this._fullField.style('display', 'block')
      .style('top', target.offsetTop);
  },

  showFullValue: function(evt) {
    var target = d3.select(evt.target),
        node = target.node(),
        field = node.parentNode.firstChild,
        fieldRect = field.getBoundingClientRect(),
        table = this._table.node(),
        left = field.offsetLeft + fieldRect.width;

    this.hideFull(evt);
    this.setState({fullValue: target.text()});
    this._fullValue.classed('odd', target.classed('odd'))
      .classed('even', target.classed('even'))
      .style('display', 'block')
      .style('left', node.offsetLeft - table.scrollLeft + left)
      .style('top', field.offsetTop);
  },

  hideFull: function(evt) {
    this.setState({fullField: null, fullValue: null});
    this._fullField.style('display', 'none');
    this._fullValue.style('display', 'none');
  },

  handleDragStart: function(evt) {
    sg.set(sg.MODE, 'channels');
    model.update();
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
    var sel = sg.get(sg.SELECTED),
        cell = sg.get(sg.CELL),
        fullField = this.state.fullField,
        dropped = sel._id && cell._id,
        prim;

    try {
      if (dropped) {
        prim = lookup(sel.mark.def.lyra_id);
        // The bind function on the primitive takes our input, parses it into
        // vega-lite (see the rules index file) -- looks up what channel we're
        // on, finds a vega-lite property, puts that in the rules object,
        // calls vega lite compile, then iterates through each part of the rule.
        prim.bind(cell.key, fullField._id);
      }
    } catch (e) {
      console.warn('Unable to bind primitive');
      console.warn(e);
    }

    sg.set(sg.MODE, 'handles');
    sg.set(sg.CELL, {});

    if (dropped) {
      this.requestVegaReparse();
    }
  },

  handleDrop: function(evt) {
    if (evt.preventDefault) {
      evt.preventDefault(); // Necessary. Allows us to drop.
    }

    return false;
  },

  render: function() {
    var state = this.state,
        props = this.props,
        page = state.page,
        limit = state.limit,
        start = page * limit,
        stop = start + limit,
        dataset = props.dataset,
        schema = dataset.schema(),
        output = dataset.output(),
        values = output.slice(start, stop),
        keys = dl.keys(schema),
        max = output.length,
        fmt = dl.format.auto.number(),
        fullField = state.fullField,
        fullValue = state.fullValue;

    var typeIcons = {
      nominal: 'font', ordinal: 'font',
      quantitative: 'hashtag', temporal: 'calendar'
    };

    var prev = page > 0 ?
          <i className="fa fa-arrow-left" onClick={this.prevPage}></i> : null,
        next = page + 1 < max / limit ?
          <i className="fa fa-arrow-right" onClick={this.nextPage}></i> : null;

    fullField = fullField ? (
      <span>
        <i className={'fa fa-' + typeIcons[fullField._type]}></i> {fullField._name}
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
                      <td key={v._id} className={i % 2 ? 'even' : 'odd'}
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

module.exports = addVegaReparseRequest(DataTable);
