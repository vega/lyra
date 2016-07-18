'use strict';
var React = require('react'),
    Modal = require('react-modal'),
    connect = require('react-redux').connect,
    addPipeline = require('../../actions/pipelineActions').addPipeline,
    tabular = require('../../util/dataset-utils').tabular;

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
      sourceInvalid: false
    };
  },
  proptypes: {
    selectPipeline: React.PropTypes.func
  },
  handleSubmit: function(e) {
    e.preventDefault();

    // add url validation
    var url = e.target.url.value,
        fileRe = /[^/]*$/,
        match = fileRe.exec(url),
        fileName = match[0],
        pipeline = fileName,
        dataset = {
          name: fileName,
          url: url
        };

    if (!tabular(url)) {
      this.setState({
        sourceInvalid: true
      });
      return false;
    } else {
      if (this.state.sourceInvalid) {
        this.setState({
          sourceInvalid: false
        });
      }
      this.props.selectPipeline(pipeline, dataset);
    }
  },
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
                placeholder="Copy and paste or drag and drop">
              </textarea>
            </div>
          </div>
        </div>
      </Modal>
    );
  }
});

module.exports = connect(mapStateToProps, mapDispatchToProps)(PipelineModal);
