var dl = require('datalib'),
    React = require('react'),
    ReactDOM = require('react-dom');

var ContentEditable = React.createClass({
  getInitialState: function() {
    return {edit: false};
  },

  componentDidMount: function() {
    this._el = ReactDOM.findDOMNode(this);
    this._$  = dl.mutator(this.props.field);
  },

  componentDidUpdate: function() {
    if (this.state.edit) this._el.focus();
  },

  componentWillReceiveProps: function(nextProps) {
    if (nextProps.field !== this.props.field) {
      this._$ = dl.mutator(nextProps.field);
    }
  },

  start: function() {
    this.setState({ edit: true });
  },

  stop: function() {
    this.setState({ edit: false });
  },

  handleInput: function() {
    this._$(this.props.obj, this._el.textContent.trim());
  },

  handleEnter: function(evt) {
    if(!evt.keyCode || (evt.keyCode && evt.keyCode == 13)) {
      this.stop();
    }
  },

  render: function() {
    var props = this.props;
    return (
      <div className={props.className}
        contentEditable={this.state.edit}
        onClick={props.onClick || this.start}
        onDoubleClick={props.onDoubleClick || this.start}
        onInput={this.handleInput}
        onBlur={this.stop}
        onKeyDown={this.handleEnter}>
          {props.obj[props.field]}
      </div>
    )
  }

});

module.exports = ContentEditable;