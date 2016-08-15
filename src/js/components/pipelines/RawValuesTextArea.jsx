'use strict';

var React = require('react'),
    dsUtils = require('../../util/dataset-utils');

var DraggableTextArea = React.createClass({
  propTypes: {
    success: React.PropTypes.func.isRequired,
    error: React.PropTypes.func.isRequired
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

  onChange: function(evt) {
    var props = this.props,
        target = evt.target,
        type = evt.type,
        raw  = target.value,
        pipeline = {name: 'name'},
        dataset  = {name: 'name'},
        file, reader, parsed, values;

    evt.preventDefault();

    try {
      if (type === 'change') {
        parsed = dsUtils.parseRaw(raw);
        props.success({
          pipeline: pipeline,
          dataset: (dataset.format = parsed.format, dataset),
          values: (values = parsed.values),
          schema: dsUtils.schema(values)
        });
      } else if (type === 'drop') {
        file = evt.dataTransfer.files[0];
        reader = new FileReader();
        reader.onload = function(loadEvt) {
          pipeline.name = dataset.name = file.name.match(dsUtils.NAME_REGEX)[1];
          raw = target.value = loadEvt.target.result;
          parsed = dsUtils.parseRaw(raw);
          props.success({
            pipeline: pipeline,
            dataset: (dataset.format = parsed.format, dataset),
            values: (values = parsed.values),
            schema: dsUtils.schema(values)
          });
        };
        reader.readAsText(file);
      }
    } catch (err) {
      props.error(err);
    }
  },

  render: function() {
    var props = this.props;

    return (
      <div>
        <textarea name={props.name} rows="10" cols="30"
          placeholder="Copy and paste raw values or drag and drop a file."
          onChange={this.onChange}
          onDrop={this.onChange}
          onDragOver={this.onDragEnter}
          onDragLeave={this.onDragLeave}
          className={this.state.dragActive}>
        </textarea>
      </div>
    );
  }
});

module.exports = DraggableTextArea;
