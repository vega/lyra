'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    assets = require('../../util/assets'),
    Icon   = require('../Icon');

function mapStateToProps(state, ownProps) {
  return {

  };
}

function mapDispatchToProps(dispatch, ownProps) {
  return {

    }
  };
}

var FilterField = React.createClass({
  
});

module.exports = {
  connected: connect(mapStateToProps, mapDispatchToProps)(FilterField),
  disconnected: FilterField
}
