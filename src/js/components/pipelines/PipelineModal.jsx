'use strict';
var React = require('react'),
    Modal = require('react-modal'),
    connect = require('react-redux').connect,
    addPipeline = require('../../actions/pipelineActions').addPipeline,
    dl = require('datalib');

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
// TODO maybe move form elements into own components
// in order to water down this component
var PipelineModal = React.createClass({
  getInitialState: function() {
    return {
      sourceInvalid: false
    };
  },
  proptypes: {
    selectPipeline: React.PropTypes.func
  },
  handleSubmit: function(e) {
    e.preventDefault();

    // TODO drop file extension
    var props = this.props,
        url = e.target.url.value,
        re = /[^/]*$/,
        match = re.exec(url),
        fileName = match[0],
        pipeline = fileName,
        dataset = {
          name: fileName
        };

    dl.load({url: url}, function(loadError, data) {
      if (loadError) {
        throw loadError;
      }

      dataset = this.parseRaw(data, dataset);
      props.selectPipeline(pipeline, dataset);
    }.bind(this));
  },
  // TODO user input validation
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
  // TODO switch throw to feedback label
  parseRaw: function(raw, dataset) {
    var readData,
        format = {};

    try {
      format.type = 'json';
      readData = dl.read(raw, format);
      dataset.format = format;
    } catch (error) {
      format.type = 'csv';
      readData = dl.read(raw, format);
      dataset.format = format;
      if (dl.keys(readData[0]).length === 1) {
        format.type = 'tsv';
        readData = dl.read(raw, format);
        dataset.format = format;
        if (dl.keys(readData[0]).length === 1) {
          throw new Error('Trying to import unsupported datatype');
        }
      }
    }

    dataset.values = readData;
    return dataset;
  },
  // TODO move hardcoded pipelines to separate file
  // also add example datasets of different types
  render: function() {
    var props = this.props,
        pipelines = [{
            name: 'cars',
            dataset: {
              name: 'cars.json',
              url: '/data/cars.json'
            }
          },
          {
            name: 'jobs',
            dataset: {
              name: 'jobs.json',
              url:  '/data/jobs.json'
            }
          },
          {
            name: 'gapminder',
            dataset: {
              name: 'gapminder.json',
              url:  '/data/gapminder.json'
            }
          }],
        sourceInvalidError = this.state.sourceInvalid;

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
            <div className="sect">
              <form onSubmit={this.handleSubmit}>
                <input type="text" name="url" placeholder="Enter url"/>
                <button type="submit" value="Submit">Load</button><br />
                {
                  sourceInvalidError ?
                  <label className="error">
                    Imported data must be in tabular form.
                  </label> :
                  null
                }
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
