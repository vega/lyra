'use strict';
var d3 = require('d3'),
    dl = require('datalib'),
    React = require('react'),
    ReactDOM = require('react-dom'),
    connect = require('react-redux').connect,
    Immutable = require('immutable'),
    addVegaReparseRequest = require('../mixins/addVegaReparseRequest'),
    getInVis = require('../../util/immutable-utils').getInVis,
    dsUtil = require('../../util/dataset-utils'),
    assets = require('../../util/assets'),
    Icon = require('../Icon'),
    HoverField = require('./HoverField');

function mapStateToProps(state, ownProps) {
  return {
    dataset: getInVis(state, 'datasets.' + ownProps.id)
  };
}

var DataTable = React.createClass({
  propTypes: {
    id: React.PropTypes.number,
    dataset: React.PropTypes.instanceOf(Immutable.Map)
  },

  getInitialState: function() {
    return {
      limit: 20,
      page: 0,
      hoverField: null,
      fullValue: null
    };
  },

  componentDidMount: function() {
    var el = this._el = d3.select(ReactDOM.findDOMNode(this));
    this.$table = el.select('.datatable');
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

  showHoverField: function(evt) {
    var target = evt.target;
    this.hideHover();
    this.setState({
      hoverField: {name: target.textContent, offsetTop: target.offsetTop}
    });
  },

  showHoverValue: function(evt) {
    var target = d3.select(evt.target),
        node = target.node(),
        field = node.parentNode.firstChild,
        fieldRect = field.getBoundingClientRect(),
        table = this.$table.node(),
        left = field.offsetLeft + fieldRect.width;

    this.hideHover(evt);
    this.setState({fullValue: target.text()});
    this.$fullValue.classed('odd', target.classed('odd'))
      .classed('even', target.classed('even'))
      .style('display', 'block')
      .style('left', node.offsetLeft - table.scrollLeft + left)
      .style('top', field.offsetTop);
  },

  hideHover: function(evt) {
    this.setState({hoverField: null, fullValue: null});
    this.$fullValue.style('display', 'none');
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
        output = dsUtil.output(id),
        values = output.slice(start, stop),
        keys = dl.keys(schema),
        max = output.length,
        fmt = dl.format.auto.number(),
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

    return (
      <div>
        <div className="datatable"
          onMouseLeave={this.hideHover} onScroll={this.hideHover}>
          <table><tbody>
            {keys.map(function(k) {
              return (
                <tr key={k}>
                  <td className={'field ' + props.className}
                    onMouseOver={this.showHoverField}>{k}</td>
                  {values.map(function(v, i) {
                    return (
                      <td key={k + i} className={i % 2 ? 'even' : 'odd'}
                        onMouseOver={this.showHoverValue}>{v[k]}</td>
                    );
                  }, this)}
                </tr>
              );
            }, this)}
          </tbody></table>

        <HoverField className={props.className} dsId={props.id}
          event={state.hoverField} />

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

module.exports = connect(mapStateToProps)(addVegaReparseRequest(DataTable));
