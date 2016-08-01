'use strict';

var React = require('react');

var TextArea = React.createClass({
  propTypes: {
    name: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func.isRequired,
    rows: React.PropTypes.string,
    cols: React.PropTypes.string,
    placeHolder: React.PropTypes.string
  },
  getInitialState: function() {
    return {
      dragActive: 'textarea-dnd'
    };
  },
  onDragEnter: function() {
    this.setState({
      dragActive: 'textarea-dnd active'
    });
  },
  onDragLeave: function() {
    this.setState({
      dragActive: 'textarea-dnd'
    });
  },
  render: function() {
    var props = this.props;

    return (
      <div>
        <textarea rows={props.rows || '10'} cols={props.cols || '70'}
          placeholder={props.placeHolder || 'Copy and paste or drag and drop'}
          name={props.name}
          onChange={props.changeHandler}
          onDrop={props.changeHandler}
          onDragOver={this.onDragEnter}
          onDragLeave={this.onDragLeave}
          className={this.state.dragActive}>
        </textarea>
      </div>
    );
  }
});

module.exports = TextArea;
