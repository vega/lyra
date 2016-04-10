'use strict';
var React = require('react'),
    ReactDOM = require('react-dom');

var ContentEditable = React.createClass({
  propTypes: {
    value: React.PropTypes.string,
    save: React.PropTypes.func
  },

  getInitialState: function() {
    return {
      edit: false,
      value: this.props.value
    };
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
    if (this.props.save) {
      this.props.save(this.state.value);
    }
  },

  handleInput: function() {
    this.setState({
      value: this._el.textContent.trim()
    });
  },

  handleEnter: function(evt) {
    if (!evt.keyCode || (evt.keyCode && evt.keyCode === 13)) {
      // Commit the change (triggers the blur that fires this.stop callback)
      this.setState({edit: false});
    }
  },

  render: function() {
    var props = this.props;
    return (
      <div style={props.style}
        className={(props.className || '') + ' content-editable'}
        contentEditable={this.state.edit}
        onClick={props.onClick}
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
