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
    getIn = require('../../util/immutable-utils').getIn,
    dsUtil = require('../../util/dataset-utils'),
    assets = require('../../util/assets'),
    Icon = require('../Icon'),
    bindChannel = require('../../actions/bindChannel'),
    FullField = require('./FullField');

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
   var fullField = FullField;
   this.hideFull(evt);
   this.setState({fullField: fullField});
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


      <FullField id={this.props.id} className={this.props.className}></FullField>

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
