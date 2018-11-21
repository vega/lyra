'use strict';

var React = require('react'),
    Pipeline = require('../../store/factory/Pipeline'),
    Dataset = require('../../store/factory/Dataset'),
    dsUtils = require('../../util/dataset-utils'),
    propTypes = require('prop-types'),
    createReactClass = require('create-react-class');

var DraggableTextArea = createReactClass({
  propTypes: {
    success: propTypes.func.isRequired,
    error: propTypes.func.isRequired
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
        pipeline = Pipeline('name'),
        dataset  = Dataset('name'),
        file, reader, name, parsed, values;

    evt.preventDefault();

    try {
      if (type === 'change') {
        parsed = dsUtils.parseRaw(raw);
        props.success({
          pipeline: pipeline,
          dataset: (dataset.format = parsed.format, dataset),
          values: (values = parsed.values),
          schema: dsUtils.schema(values)
        }, 'Successfully imported data!');
      } else if (type === 'drop') {
        file = evt.dataTransfer.files[0];
        reader = new FileReader();
        reader.onload = function(loadEvt) {
          name = file.name.match(dsUtils.NAME_REGEX);
          pipeline.name = dataset.name = name[1];
          raw = target.value = loadEvt.target.result;
          try {
            parsed = dsUtils.parseRaw(raw);
            props.success({
              pipeline: pipeline,
              dataset: (dataset.format = parsed.format, dataset),
              values: (values = parsed.values),
              schema: dsUtils.schema(values)
            }, 'Successfully imported ' + name[0] + '!');
          } catch (err) {
            props.error(err);
          }
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
        <textarea name={props.name} rows="8" cols="30"
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
