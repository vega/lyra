'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    assets = require('../../../util/assets'),
    Icon = require('../../Icon'),
    addTransform = require('../../../actions/datasetActions').addTransform,
    propTypes = require('prop-types'),
    createReactClass = require('create-react-class');

function mapStateToProps(state, ownProps) {
  return {};
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    formula: function() {
      var field = ownProps.field.name;
      dispatch(addTransform(ownProps.dsId,
        {type: 'formula', field: 'calc_' + field, expr: 'datum.' + field}));
    }
  };
}

var FormulaIcon = createReactClass({
  propTypes: {
    field: propTypes.object.isRequired,
    dsId:  propTypes.number,
    formula: propTypes.func
  },

  render: function() {
    return (<Icon onClick={this.props.formula}
      glyph={assets.formula} width="10" height="10"
      data-tip="Calculate a new field" />);
  }
});

module.exports = {
  connected: connect(mapStateToProps, mapDispatchToProps)(FormulaIcon),
  disconnected: FormulaIcon
};
