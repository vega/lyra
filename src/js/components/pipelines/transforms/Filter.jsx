'use strict';
var React = require('react'),
    Property = require('../../inspectors/Property');

var Filter = React.createClass({
  propTypes: {
    dsId: React.PropTypes.number.isRequired,
    index: React.PropTypes.number.isRequired,
    update: React.PropTypes.func.isRequired
  },

  updateFilter: function(value) {
    var props = this.props,
        val = value.target ? value.target.value : value;
    props.update({type: 'filter', test: val});
  },

  render: function() {
    var props = this.props,
        dsId = props.dsId;

    return (
      <Property type="autocomplete" autoType="expr" label="Filter"
        primType="datasets" primId={dsId} name={'transform.' + props.index + '.test'}
        dsId={dsId} onChange={this.updateFilter} />
    );
  }
});

module.exports = Filter;
