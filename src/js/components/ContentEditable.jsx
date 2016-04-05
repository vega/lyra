'use strict';
var React = require('react'),
    ReactDOM = require('react-dom'),
    SignalValueMixin = require('./mixins/SignalValue');

var ContentEditable = React.createClass({
  mixins: [SignalValueMixin],

  getInitialState: function() {
    return {edit: false};
  },

  componentDidMount: function() {
    this._el = ReactDOM.findDOMNode(this);
  },

  componentDidUpdate: function() {
    if (this.state.edit) {
      this._el.focus();
    }
  },

  componentWillUnmount: function() {
    this._el = null;
  },

  start: function() {
    this.setState({edit: true});
  },

  stop: function() {
    this.setState({edit: false});
    var obj = this.props.obj;
    if (!obj) {
      return;
    }

    var Sidebars = require('./');
    Sidebars.forceUpdate();
  },

  handleInput: function() {
    this.setValue(this._el.textContent.trim());
  },

  handleEnter: function(evt) {
    if (!evt.keyCode || (evt.keyCode && evt.keyCode === 13)) {
      this.stop();
    }
  },

  render: function() {
    var props = this.props;
    return (
      <div style={props.style}
        className={(props.className || '') + ' content-editable'}
        contentEditable={this.state.edit}
        onClick={props.onClick || this.start}
        onDoubleClick={props.onDoubleClick || this.start}
        onInput={this.handleInput}
        onBlur={this.stop}
        onKeyDown={this.handleEnter}>
          {this.state.value}
      </div>
    );
  }

});

module.exports = ContentEditable;
