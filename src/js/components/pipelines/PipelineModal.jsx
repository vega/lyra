'use strict';
var React = require('react'),
    Modal = require('react-modal'),
    connect = require('react-redux').connect,
    addPipeline = require('../../actions/pipelineActions').addPipeline,
    dl = require('datalib'),
    examplePipelines = require('../../constants/exampledatasets');

function mapStateToProps(state, ownProps) {
  return {};
}
function mapDispatchToProps(dispatch, ownProps) {
  return {
    selectPipeline: function(pipelineName, dataset) {

      dispatch(addPipeline({
        name: pipelineName
      }, dataset));
      ownProps.closeModal();
    }
  };
}
var PipelineModal = React.createClass({
  getInitialState: function() {
    return {
      error: {
        value: false,
        message: ''
      }
    };
  },
  proptypes: {
    selectPipeline: React.PropTypes.func
  },
  handleSubmit: function(e) {
    e.preventDefault();

    var props = this.props,
        url = e.target.url.value,
        re = /([\w\d_-]*)\.?[^\\\/]*$/i,
        fileName = url.match(re)[1],
        pipeline = fileName,
        dataset = {
          name: fileName
        };

    dl.load({url: url}, function(loadError, data) {
      if (loadError) {
        if (loadError.statusText) {
          this.setState({
            error: {
              value: true,
              message: loadError.statusText
            }
          });
          throw loadError;
        }
      } else {
        dataset = this.parseRaw(data, dataset);
        props.selectPipeline(pipeline, dataset);
      }
    }.bind(this));
  },
  cpChangeHandler: function(e) {
    e.preventDefault();

    var target = e.target,
        props = this.props,
        type = e.type,
        pipeline = 'name',
        dataset = {
          name: 'name'
        },
        raw;

    if (type === 'change') {
      raw = target.value;

      dataset = this.parseRaw(raw, dataset);
      props.selectPipeline(pipeline, dataset);
    } else if (type === 'drop') {
      var file = e.dataTransfer.files[0],
          fr = new FileReader();

      fr.onload = function(loadEvent) {
        raw = loadEvent.target.result;

        dataset = this.parseRaw(raw, dataset);
        props.selectPipeline(pipeline, dataset);
      }.bind(this);

      fr.readAsText(file);
    }
  },
  parseRaw: function(raw, dataset) {
    var readData,
        format = {};

    try {
      format.type = 'json';
      readData = dl.read(raw, format);
      dataset.format = format;
      dataset.values = raw;
    } catch (error) {
      format.type = 'csv';
      readData = dl.read(raw, format);
      dataset.format = format;
      if (dl.keys(readData[0]).length === 1) {
        format.type = 'tsv';
        readData = dl.read(raw, format);
        dataset.format = format;
        if (dl.keys(readData[0]).length === 1) {
          this.setState({
            error: {
              value: true,
              message: 'Trying to import data thats in an unsupported format!'
            }
          });
          throw new Error('Trying to import data thats in an unsupported format!');
        } else {
          dataset.values = raw;
        }
      } else {
        dataset.values = raw;
      }
    }

    return dataset;
  },
  render: function() {
    var props = this.props,
        pipelines = examplePipelines,
        error = this.state.error;

    return (
      <Modal
        isOpen={props.modalIsOpen}
        onRequestClose={props.closeModal}>
        <div className="wrapper pipelineModal">
          <span className="closeModal" onClick={props.closeModal}>close</span>
          <div className="partLeft">
            <h2>Examples</h2>
            <div className="sect">
              <h4>Datasets</h4><br />
              <ul>
                {pipelines.map(function(pipeline) {
                  var name = pipeline.name,
                      dateset = pipeline.dataset;
                  return (
                    <li key={name}>
                      <button onClick={props.selectPipeline.bind(null, name, dateset, this.closeModal)}>
                        {name}
                      </button>
                    </li>
                  );
                }, this)}
              </ul>
            </div>

          </div>
          <div className="partRight">
            <h2>Import</h2>
            <label>
              Supported import formats include <abbr title="JavaScripts Object Notation">JSON</abbr>,
              <abbr title="Coma Separated Values">CSV</abbr> and <abbr title="Tab Separated Values">TSV</abbr>.<br />
              All data <strong>must</strong> be in tabular form.
            </label>
            <div className="sect">
              {error.value ? <label className="error">{error.message}</label> : null}
            </div>
            <div className="sect">
              <form onSubmit={this.handleSubmit}>
                <input type="text" name="url" placeholder="Enter url"/>
                <button type="submit" value="Submit">Load</button><br />
              </form>
            </div>
            <div className="sect">
              <textarea rows="10" cols="70"
                placeholder="Copy and paste or drag and drop"
                name="cnpDnd"
                onChange={this.cpChangeHandler}
                onDrop={this.cpChangeHandler}>
              </textarea>
            </div>
          </div>
        </div>
      </Modal>
    );
  }
});

module.exports = connect(mapStateToProps, mapDispatchToProps)(PipelineModal);
