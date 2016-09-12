'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    assets = require('../../../util/assets'),
    Icon = require('../../Icon'),
    addTransform = require('../../../actions/datasetActions').addTransform;

function mapStateToProps(state, ownProps) {
  return {};
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    formula: function() {
      dispatch(addTransform(ownProps.dsId,
        {type: 'formula', field: '', expr: 'datum.' + ownProps.field.name}));
    }
  };
}

var FormulaIcon = React.createClass({
  propTypes: {
    field: React.PropTypes.object.isRequired,
    dsId:  React.PropTypes.number,
    formula: React.PropTypes.func
  },

  render: function() {
    return (<Icon onClick={this.props.formula}
      glyph={assets.formula} width="10" height="10"
      data-tip="Formula" />);
  }
});

module.exports = {
  connected: connect(mapStateToProps, mapDispatchToProps)(FormulaIcon),
  disconnected: FormulaIcon
};
