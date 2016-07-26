'use strict';
var React = require('react'),
    Modal = require('react-modal'),
    connect = require('react-redux').connect,
    addPipeline = require('../../actions/pipelineActions').addPipeline,
    dl = require('datalib'),
    examplePipelines = require('../../constants/exampledatasets');

var FILE_NAME = /([\w\d_-]*)\.?[^\\\/]*$/i;

function mapStateToProps(state, ownProps) {
  return {};
}
function mapDispatchToProps(dispatch, ownProps) {
  return {
    selectPipeline: function(pipeline, dataset, values) {
      dispatch(addPipeline(pipeline, dataset, values));
    }
  };
}
var PipelineModal = React.createClass({
  getInitialState: function() {
    return {
      error: {
        value: false,
        message: ''
      },
      success: {
        value: false,
        message: ''
      },
      dragActive: 'textarea-dnd'
    };
  },
  proptypes: {
    selectPipeline: React.PropTypes.func,
    closeModal: React.PropTypes.func
  },
  loadURL: function(url, pipeline, dataset) {
    var that = this,
        fileName = url.match(FILE_NAME)[1];

    /* eslint no-multi-spaces:0 */
    pipeline = pipeline || {name: fileName};
    dataset  = dataset  || {name: fileName, url: url};

    dl.load({url: url}, function(err, data) {
      if (err) {
        // TODO: err is an XHR object and will not have a statusText.
        if (err.statusText) {
          that.onError(err.statusText);
        }
        throw err;
      } else {
        that.props.selectPipeline(pipeline, dataset, that.parseRaw(data, dataset));
        that.onSuccess();
      }
    });
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
  parseRaw: function(raw, dataset) {
    var format = dataset.format = {parse: 'auto'},
        parsed;

    try {
      format.type = 'json';
      return dl.read(raw, format);
    } catch (error) {
      format.type = 'csv';
      parsed = dl.read(raw, format);

      // Test successful parsing of CSV/TSV data by checking # of fields found.
      // If file is TSV but was parsed as CSV, the entire header row will be
      // parsed as a single field.
      if (dl.keys(parsed[0]).length > 1) {
        return parsed;
      }

      format.type = 'tsv';
      parsed = dl.read(raw, format);
      if (dl.keys(parsed[0]).length > 1) {
        return parsed;
      }
      var errorMsg = 'Trying to import data thats in an unsupported format!';
      this.onError(errorMsg);
      throw new Error('Trying to import data thats in an unsupported format!');
    }

    return [];
  },
  onSuccess: function(msg) {
    this.setState({
      error: {
        value: false,
        message: ''
      },
      success: {
        value: true,
        message: 'Successful import!'
      }
    });
  },
  onError: function(msg) {
    this.setState({
      error: {
        value: true,
        message: msg
      },
      success: {
        value: false,
        message: ''
      }
    });
  },
  handleSubmit: function(evt) {
    this.loadURL(evt.target.url.value);
    evt.preventDefault();
  },
  cpChangeHandler: function(evt) {
    var that = this,
        props = that.props,
        target = evt.target,
        type = evt.type,
        pipeline = {name: 'name'},
        dataset  = {name: 'name'},
        raw = target.value,
        file, reader;

    evt.preventDefault();

    if (type === 'change') {
      props.selectPipeline(pipeline, dataset, that.parseRaw(raw, dataset));
      that.onSuccess();
    } else if (type === 'drop') {
      file = evt.dataTransfer.files[0];
      reader = new FileReader();
      reader.onload = function(loadEvt) {
        pipeline.name = dataset.name = file.name.match(FILE_NAME)[1];
        raw = loadEvt.target.result;
        props.selectPipeline(pipeline, dataset, that.parseRaw(raw, dataset));

        that.onSuccess();
        target.value = raw;
        that.onDragLeave();
      };

      reader.readAsText(file);
    }
  },
  select: function(url, name, dataset) {
    this.loadURL(url, name, dataset);
    this.completeImport();
  },
  completeImport: function() {
    this.setState({
      error: {
        value: false,
        message: ''
      },
      success: {
        value: false,
        message: ''
      }
    });
    this.props.closeModal();
  },
  render: function() {
    var props = this.props,
        pipelines = examplePipelines,
        state = this.state,
        error = state.error,
        success = state.success,
        dragActive = state.dragActive;

    return (
      <Modal
        isOpen={props.modalIsOpen}
        onRequestClose={props.closeModal}>
        <div className="wrapper pipelineModal">
          <span className="closeModal" onClick={props.closeModal}>close</span>
          <div className="partLeft">
            <h2>Examples</h2>

            <div className="sect">
              <h4>Datasets</h4>

              <ul>
                {pipelines.map(function(pipeline) {
                  var name = pipeline.name,
                      dataset = pipeline.dataset;
                  return (
                    <li key={name}>
                      <button onClick={this.select.bind(this, dataset.url, {name: name}, dataset)}>
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
              <form onSubmit={this.handleSubmit}>
                <input type="text" name="url" placeholder="Enter url"/>
                <button type="submit" value="Submit" className="button">Load</button><br />
              </form>
            </div>

            <div className="sect">
              <textarea rows="10" cols="70"
                placeholder="Copy and paste or drag and drop"
                name="cnpDnd"
                onChange={this.cpChangeHandler}
                onDrop={this.cpChangeHandler}
                onDragOver={this.onDragEnter}
                onDragLeave={this.onDragLeave}
                className={dragActive}>
              </textarea><br />
            </div>
            <div className="sect">
              {error.value ? <label className="error">{error.message}</label> : null}
              {success.value ? <label className="success">{success.message}</label> : null}<br />
              {success.value ?
                <button className="button button-success"
                  onClick={this.completeImport}>
                  Done
                </button> : null}
            </div>
          </div>
        </div>
      </Modal>
    );
  }
});

module.exports = connect(mapStateToProps, mapDispatchToProps)(PipelineModal);
