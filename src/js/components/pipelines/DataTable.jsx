'use strict';
var d3 = require('d3'),
    dl = require('datalib'),
    React = require('react'),
    ReactDOM = require('react-dom'),
    connect = require('react-redux').connect,
    Immutable = require('immutable'),
    getInVis = require('../../util/immutable-utils').getInVis,
    dsUtil = require('../../util/dataset-utils'),
    assets = require('../../util/assets'),
    Icon = require('../Icon'),
    HoverField = require('./HoverField'),
    HoverValue = require('./HoverValue');

function mapStateToProps(state, ownProps) {
  return {
    dataset: getInVis(state, 'datasets.' + ownProps.id),
    vega: state.get('vega')
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
      hoverValue: null
    };
  },

  componentDidMount: function() {
    var el = d3.select(ReactDOM.findDOMNode(this));
    this.$table = el.select('.datatable');
  },

  shouldComponentUpdate: function(nextProps, nextState) {
    var vega = nextProps.vega;
    return !vega.get('invalid') && !vega.get('isParsing');
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
    this.setState({
      hoverField: {name: target.textContent, offsetTop: target.offsetTop},
      hoverValue: null
    });
  },

  showHoverValue: function(evt) {
    this.setState({
      hoverField: null,
      hoverValue: (evt.persist(), evt)
    });
  },

  hideHover: function(evt) {
    this.setState({hoverField: null, hoverValue: null});
  },

  render: function() {
    var state = this.state,
        props = this.props,
        page  = state.page,
        limit = state.limit,
        start = page * limit,
        stop  = start + limit,
        id = props.id,
        schema = id ? dsUtil.schema(id) : props.schema,
        output = id ? dsUtil.output(id) : props.values,
        values = output.slice(start, stop),
        keys = dl.keys(schema),
        max = output.length,
        fmt = dl.format.auto.number(),
        scrollLeft = this.$table && this.$table.node().scrollLeft;

    var prev = page > 0 ? (
      <Icon glyph={assets.prev} width="10" height="10" onClick={this.prevPage} />
    ) : null;

    var next = page + 1 < max / limit ? (
      <Icon glyph={assets.next} width="10" height="10" onClick={this.nextPage} />
    ) : null;

    return (
      <div>
        <div className="datatable"
          onMouseLeave={this.hideHover} onScroll={this.hideHover}>

          <table>
            <tbody>
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
            </tbody>
          </table>
          <HoverField className={props.className} dsId={id}
            schema={schema} def={state.hoverField} />
          <HoverValue event={state.hoverValue} scrollLeft={scrollLeft} />
        </div>

        <div className="paging">
          <span>{fmt(start + 1)}–{stop > max ? fmt(max) : fmt(stop)} of {fmt(max)}</span>
          <span className="pager">{prev} {next}</span>
        </div>
      </div>
    );
  }

});

module.exports = connect(mapStateToProps)(DataTable);
