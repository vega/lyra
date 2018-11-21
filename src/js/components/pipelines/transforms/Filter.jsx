'use strict';
var React = require('react'),
    parseExpr = require('vega').parse.expr(),
    Property  = require('../../inspectors/Property'),
    propTypes = require('prop-types'),
    createReactClass = require('create-react-class');

var Filter = createReactClass({
  propTypes: {
    dsId: propTypes.number.isRequired,
    index: propTypes.number.isRequired,
    update: propTypes.func.isRequired
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
