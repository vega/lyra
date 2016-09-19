'use strict';
var React = require('react'),
    parseExpr = require('vega').parse.expr(),
    Property  = require('../../inspectors/Property');

var Filter = React.createClass({
  propTypes: {
    dsId: React.PropTypes.number.isRequired,
    index: React.PropTypes.number.isRequired,
    update: React.PropTypes.func.isRequired
  },

  updateFilter: function(value) {
    var props = this.props,
        val = value.target ? value.target.value : value;

    try {
      parseExpr(val);
      props.update({type: 'filter', test: val});
    } catch (e) {
      // Do nothing if the expression doesn't parse correctly.
    }
  },

  render: function() {
    var props = this.props,
        dsId  = props.dsId;

    return (
      <Property type="autocomplete" autoType="expr" label="Filter"
        primType="datasets" primId={dsId} name={'transform.' + props.index + '.test'}
        dsId={dsId} onChange={this.updateFilter} />
    );
  }
});

module.exports = Filter;
