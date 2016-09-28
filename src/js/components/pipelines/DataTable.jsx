'use strict';
var d3 = require('d3'),
    dl = require('datalib'),
    React = require('react'),
    ReactDOM = require('react-dom'),
    connect = require('react-redux').connect,
    Immutable = require('immutable'),
    imutils  = require('../../util/immutable-utils'),
    getInVis = imutils.getInVis,
    getIn  = imutils.getIn,
    dsUtil = require('../../util/dataset-utils'),
    assets = require('../../util/assets'),
    Icon = require('../Icon'),
    HoverField = require('./HoverField'),
    HoverValue = require('./HoverValue'),
    TransformList = require('./transforms/TransformList').connected,
    Property = require('../inspectors/Property');

function mapStateToProps(state, ownProps) {
  var id = ownProps.id;
  return {
    dataset: getInVis(state, 'datasets.' + id),
    vega: state.get('vega')
  };
}

var DataTable = React.createClass({
  propTypes: {
    id: React.PropTypes.number,
    dataset: React.PropTypes.instanceOf(Immutable.Map)
  },

  getInitialState: function() {
    return dl.extend({
      limit: 20,
      page: 0,
      hoverField: null,
      hoverValue: null,
      facet:  null,
      values: [],
      facets: []
    }, this.getValues(this.props));
  },

  componentDidMount: function() {
    var el = d3.select(ReactDOM.findDOMNode(this));
    this.$table = el.select('.datatable');
  },

  componentWillReceiveProps: function(nextProps) {
    var dataset = nextProps.dataset,
        facet = dataset && getIn(dataset, '_facet.groupby');

    if (!facet || (this.shouldComponentUpdate(nextProps) &&
        dataset !== this.props.dataset)) {
      this.setState(this.getValues(nextProps));
    }
  },

  shouldComponentUpdate: function(nextProps, nextState) {
    var vega = nextProps.vega;
    return !vega.get('invalid') && !vega.get('isParsing');
  },

  getValues: function(props) {
    var id = props.id,
        groupby = getIn(props.dataset, '_facet.groupby'),
        output  = id ? dsUtil.output(id) : props.values,
        facets;

    return groupby ? {
      facet:  0,
      values: (facets = dl.groupby(groupby = groupby.toJS())
        .summarize({'*': ['values']}).execute(output)),
      facets: facets.map(function(f) {
        return groupby.map(dl.$).map((k) => k(f)).join('|');
      })
    } : {
      facet:  null,
      facets: [],
      values: output
    };
  },

  changeFacet: function(evt) {
    this.setState({facet: evt.target.value});
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
        schema = id ? props.dataset.get('_schema').toJS() : props.schema,
        facet  = state.facet,
        output = facet !== null ? state.values[facet].values : state.values,
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

        <TransformList dsId={id} />

        {facet === null ? null : (
          <Property name="facet" label="Facet" className="facet">
            <div className="control">
              <select onChange={this.changeFacet} value={facet}>
                {state.facets.map(function(key, idx) {
                  return (<option key={idx} value={idx}>{key}</option>);
                })}
              </select>
            </div>
          </Property>
        )}

        <div className="datatable"
          onMouseLeave={this.hideHover} onScroll={this.hideHover}>

          <table>
            <tbody>
              {keys.map(function(k) {
                return (
                  <tr key={k}>
                    <td className={'field ' + (schema[k].source ? 'source' : 'derived')}
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
          {id ? <HoverField dsId={id} schema={schema} def={state.hoverField} /> : null}
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
