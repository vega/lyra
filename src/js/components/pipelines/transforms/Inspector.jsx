'use strict';
var React = require('react'),
    Immutable = require('immutable'),
    connect = require('react-redux').connect,
    getInVis = imutils.getInVis,
    ExpressionTextbox = require('./ExpressionTextbox');

function mapStateToProps(state, ownProps) {
  var id = ownProps.dsId;
  return {
    transforms: getInVis(state, 'datasets.' + id + '._transforms');
  };
}

var Inspector = React.createClass({
  propTypes: {
    dsId:  React.PropTypes.number,
    transforms:  React.PropTypes.array
  },

  render: function() {

  }
});

module.exports = connect(mapStateToProps)(Inspector);
