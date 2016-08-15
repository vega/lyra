'use strict';
var React = require('react'),
    Modal = require('react-modal'),
    connect = require('react-redux').connect,
    dl = require('datalib'),
    addPipeline = require('../../actions/pipelineActions').addPipeline,
    exampleDatasets = require('../../constants/exampleDatasets'),
    DataPreview = require('./DataPreview'),
    RawValuesTextArea = require('./RawValuesTextArea'),
    DatasetLoader = require('./DatasetLoader'),
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
          schema: dsUtils.schema(values)
        });
      })
      .catch(function(err) {
        that.error(err.statusText || err);
      });
  },

  render: function() {
    var props = this.props,
        state = this.state,
        error = state.error,
        success = state.success;

    return (
      <Modal isOpen={props.modalIsOpen} onRequestClose={props.closeModal}>
        <div className="wrapper pipelineModal">
          <span className="closeModal" onClick={this.done.bind(this, false)}>close</span>

          <div className="partLeft">
            <h1>Example Datasets</h1>

            <div className="sect">
              <ul>
                {exampleDatasets.map(function(example) {
                  var name = example.name,
                      description = example.description,
                      dataset = example.dataset;
                  return (
                    <li key={name} className="item-li">
                      <span onClick={this.loadURL.bind(this, dataset.url)}
                        className="item-clickable">
                        {name}
                      </span>
                      <label className="item-label">{description}</label>
                    </li>
                  );
                }, this)}
              </ul>
            </div>
          </div>

          <div className="partRight">
            <h1>Import</h1>

            <div className="sect">
              <label className="margined-top">
                Supported import formats include <abbr title="JavaScripts Object Notation">JSON</abbr>,
                <abbr title="Coma Separated Values">CSV</abbr> and <abbr title="Tab Separated Values">TSV</abbr>.<br />
                All data <strong>must</strong> be in tabular form.
              </label><br />

              <DatasetLoader loadURL={this.loadURL} />
            </div>

            <div className="sect">
              <RawValuesTextArea name="cnpDnd" success={this.success} error={this.error} />

              {state.showPreview ?
                <DataPreview values={state.values} schema={state.schema} /> : null}
            </div>

            <div className="sect">
              {error ? <label className="error">{error}</label> : null}
              {success ? <label className="success">{success}</label> : null}<br />
              {success ?
                <button className="button button-success"
                  onClick={this.done.bind(this, true)}>
                  Done
                </button> : null}
            </div>
          </div>
        </div>
      </Modal>
    );
  }
});

module.exports = {
  connected: connect(mapStateToProps, mapDispatchToProps)(PipelineModal),
  disconnected: PipelineModal
};
