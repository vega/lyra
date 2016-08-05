'use strict';

var React  = require('react'),
    dsUtil = require('../../util/dataset-utils'),
    MTYPES = dsUtil.MTYPES,
    assets = require('../../util/assets'),
    Icon   = require('../Icon');

var FieldType = React.createClass({
  propTypes: {
    field: React.PropTypes.object
  },

  getInitialState: function() {
    return {type: null};
  },

  changeType: function(evt) {
    var field  = this.props.field,
        idx = MTYPES.indexOf(field.mtype);

    idx = (idx + 1) % MTYPES.length;
    this.setState({type: (field.mtype = MTYPES[idx])});
  },

  render: function() {
    var type = this.state.type || this.props.field.mtype;
    return (
      <Icon onClick={this.changeType}
        glyph={assets[type]} width="10" height="10" />
    );
  }
});

module.exports = FieldType;
