'use strict';
var React = require('react'),
    Modal = require('react-modal'),
    connect = require('react-redux').connect,
    addPipeline = require('../../actions/pipelineActions').addPipeline;

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
          }];

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
              <label>Url: </label>
              <input type="text" onChange={null} />
              <button onChange={null}>Load</button>
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
