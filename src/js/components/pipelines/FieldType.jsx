'use strict';

var React  = require('react'),
    connect = require('react-redux').connect,
    ReactTooltip = require('react-tooltip'),
    capitalize = require('capitalize'),
    changeFieldMType = require('../../actions/datasetActions').changeFieldMType,
    MTYPES = require('../../constants/measureTypes'),
    assets = require('../../util/assets'),
    Icon   = require('../Icon');

function mapStateToProps() {
  return {};
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    changeType: function() {
      var field = ownProps.field,
          idx = MTYPES.indexOf(field.mtype);

      idx = (idx + 1) % MTYPES.length;
      dispatch(changeFieldMType(ownProps.dsId, field.name, MTYPES[idx]));
    }
  };
}

var FieldType = React.createClass({
  propTypes: {
    dsId: React.PropTypes.number.isRequired,
    field: React.PropTypes.object
  },

  componentDidUpdate: function() {
    ReactTooltip.rebuild();
  },

  render: function() {
    var props = this.props,
        type  = props.field.mtype;
    return (
      <Icon onClick={props.changeType} glyph={assets[type]} width="10" height="10"
        data-tip={capitalize(type) + ' field'} />
    );
  }
});

module.exports = connect(mapStateToProps, mapDispatchToProps)(FieldType);
