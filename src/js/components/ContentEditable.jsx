'use strict';
var React = require('react'),
    ReactDOM = require('react-dom');

var ContentEditable = React.createClass({
  propTypes: {
    value: React.PropTypes.string,
    save: React.PropTypes.func
  },

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
    if (this.props.save) {
      this.props.save(this._el.textContent.trim());
    }
  },

  // On enter press, commit the change by triggering blur.
  handleEnter: function(evt) {
    if (!evt.keyCode || (evt.keyCode && evt.keyCode === 13)) {
      this._el.blur();
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
        onBlur={this.stop}
        onKeyDown={this.handleEnter}>
          {props.value}
      </div>
    );
  }

});

module.exports = ContentEditable;
