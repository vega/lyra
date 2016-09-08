'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    assets = require('../../../../util/assets'),
    Icon   = require('../../../Icon'),
    addTransform = require('../../../../actions/datasetActions').addTransform;

function mapStateToProps(state, ownProps) {
  return {};
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    addTransform: function(dsId, transformSpec) {
      dispatch(addTransform(dsId, transformSpec));
    }
  };
}

var FormulaField = React.createClass({

  propTypes: {
    field: React.PropTypes.object.isRequired,
    dsId:  React.PropTypes.number,
    addTransform: React.PropTypes.func
  },

  showTextbox: function(evt) {
    var props = this.props,
        dsId = props.dsId,
        fieldname = props.field.name,
        expr = 'datum.' + fieldname,
        transform = {
          type: 'formula',
          field: fieldname,
          expr: expr
        };

    this.props.addTransform(dsId, transform);

  },

  render: function() {
    return (<Icon onClick={this.showTextbox}
      glyph={assets.formula} width="10" height="10"
      data-tip="Formula" />);
  }
});

module.exports = {
  connected: connect(mapStateToProps, mapDispatchToProps)(FormulaField),
  disconnected: FormulaField
};
