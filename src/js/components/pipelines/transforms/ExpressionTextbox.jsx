'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    Property = require('../../inspectors/Property');

function mapStateToProps(state, ownProps) {
  return {};
}

function mapDispatchToProps(dispatch, ownProps) {
  return {};
}

var ExpressionTextbox = React.createClass({
  propTypes: {
    dsId:  React.PropTypes.number
  },

  getInitialState: function() {
    return {expanded: true};
  },

  timer: null,

  resetTimer: function() {
    var that = this;
    window.clearTimeout(this.timer);
    this.timer = window.setTimeout(function() {
        that.setState({expanded: false});
      }, 10000);
  },

  applyTransformation: function(e) {
    var props = this.props,
        id = props.dsId,
        oldSpec = props.spec,
        editTransform = props.editTransform;
    editTransform(id, oldSpec, e);
  },

  render: function() {
    var props = this.props,
        id = props.dsId;

    return this.state.expanded ? (
      <Property name="expressionProp" type="autocomplete"   autoType="expr" dsId={id} {...props} onChange={this.applyTransformation}>
      </Property>
    ) : null;
  }
});

module.exports = {
  connected: connect(mapStateToProps, mapDispatchToProps)(ExpressionTextbox),
  disconnected: ExpressionTextbox
}
