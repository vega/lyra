'use strict';
var React = require('react'),
    Modal = require('react-modal'),
    connect = require('react-redux').connect,
    dl = require('datalib'),
    addPipeline = require('../../actions/pipelineActions').addPipeline,
    exampleDatasets = require('../../constants/exampleDatasets'),
    DataTable = require('./DataTable'),
    RawValuesTextArea = require('./RawValuesTextArea'),
    DataURL = require('./DataURL'),
    dsUtils = require('../../util/dataset-utils');

function mapStateToProps(state, ownProps) {
  return {};
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    addPipeline: function(pipeline, dataset, values, schema) {
      dispatch(addPipeline(pipeline, dataset, values, schema));
    }
  };
}

var PipelineModal = React.createClass({
  propTypes: {
    addPipeline: React.PropTypes.func,
    closeModal: React.PropTypes.func.isRequired,
    modalIsOpen: React.PropTypes.bool.isRequired
  },

  getInitialState: function() {
    return {
      error: null,
      success: null,
      showPreview: false,
      selectedExample: null,

      pipeline: null,
      dataset: null,
      values: null,
      schema: null,
    };
  },

  success: function(state, msg, preview) {
    this.setState(dl.extend({
      error: null,
      success: msg || 'Successful import!',
      showPreview: !(preview === false)
    }, state));
  },

  error: function(msg) {
    this.setState({
      error: msg || 'An error occured!',
      success: null
    });
  },

  done: function(save) {
    var state = this.state;
    if (save && state.error === null) {
      this.props.addPipeline(state.pipeline, state.dataset,
        state.values, state.schema);
    }

    this.setState(this.getInitialState());
    this.props.closeModal();
  },

  loadURL: function(url) {
    var that = this;
    dsUtils.loadURL(url)
      .then(function(loaded) {
        var dataset = loaded.dataset,
            parsed = dsUtils.parseRaw(loaded.data),
            values = parsed.values;

        that.success({
          pipeline: loaded.pipeline,
          dataset: (dataset.format = parsed.format, dataset),
          values: values,
          schema: dsUtils.schema(values),
          selectedExample: url
        });
      })
      .catch(function(err) {
        that.error(err.statusText);
      });
  },

  render: function() {
    var props = this.props,
        state = this.state,
        error = state.error,
        success = state.success,
        preview = state.showPreview,
        close = this.done.bind(this, false);

    var style = {
      overlay: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      },
      content: {
        // position: null,
        overflow: 'hidden',
        top: null, bottom: null, left: null, right: null,
        width: '550px',
        height: preview ? 'auto' : '300px',
        padding: null
      }
    };

    return (
      <Modal isOpen={props.modalIsOpen} onRequestClose={close}
        style={style}>
        <div className="pipelineModal">
          <span className="closeModal" onClick={close}>close</span>

          <div className="examples">
            <h2>Example Datasets</h2>

            <ul>
              {exampleDatasets.map(function(example) {
                var name = example.name,
                    description = example.description,
                    url = example.url,
                    className = state.selectedExample === url ? 'selected' : null;

                return (
                  <li key={name} onClick={this.loadURL.bind(this, url)}
                    className={className}>
                    <p className="example-name">{name}</p>
                    <p>{description}</p>
                  </li>
                );
              }, this)}
            </ul>
          </div>

          <div className="load">
            <h2>Import</h2>

            <p>
              Data must be in a tabular form. Supported import
              formats include <abbr title="JavaScripts Object Notation">json</abbr>, <abbr title="Coma Separated Values">csv</abbr> and <abbr title="Tab Separated Values">tsv</abbr>
            </p>

            <DataURL loadURL={this.loadURL} />
            <RawValuesTextArea success={this.success} error={this.error} />
          </div>

          {error ? <div className="error-message">{error}</div> : null}

          {!preview || error ? null : (
            <div className="preview">
              <h2>Preview</h2>

              {success ? <div className="success-message">{success}</div> : null}

              <DataTable className="source"
                values={state.values} schema={state.schema} />

              <button className="button button-success"
                onClick={this.done.bind(this, true)}>
                Import
              </button>
            </div>
          )}
        </div>
      </Modal>
    );
  }
});

module.exports = {
  connected: connect(mapStateToProps, mapDispatchToProps)(PipelineModal),
  disconnected: PipelineModal
};
