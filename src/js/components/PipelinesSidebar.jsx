'use strict';
var React = require('react'),
    PipelineList = require('./pipelines/PipelineList'),
    connect = require('react-redux').connect,
    getIn = require('../util/immutable-utils').getIn,
    get = require('../util/immutable-utils').get,
    assets = require('../util/assets'),
    Modal = require('react-modal'),
    Icon = require('./Icon');

function mapStateToProps(state, ownProps) {
  // pipelines used for listing out example
  // datasets in Modal
  return {
    pipelines: getIn(state, 'pipelines')
  };
}

var PipelineSidebar = React.createClass({
  getInitialState: function() {
    // currentPipelines is a list of ids for all
    // pipelines the user has added via modal
    return {
      modalIsOpen: false,
      currentPipelines: []
    };
  },
  openModal: function() {
    this.setState({modalIsOpen: true});
  },
  closeModal: function() {
    this.setState({modalIsOpen: false});
  },
  addPipeline: function(id) {
    var pipelineKeys = this.state.currentPipelines;

    if (pipelineKeys.indexOf(id) === -1) {
      pipelineKeys.push(id);
    }

    this.setState({
      currentPipelines: pipelineKeys
    });
  },
  removePipeline: function(id) {},
  render: function() {
    var props = this.props,
        pipelines = props.pipelines,
        pipelineKeys = this.state.currentPipelines;

    return (
      <div className="sidebar" id="pipeline-sidebar">
        <h2>Data Pipelines
          <span className="new" onClick={this.openModal}>
            <Icon glyph={assets.plus} /> New
          </span>
        </h2>
        <PipelineList pipelineKeys={pipelineKeys} />
        <Modal
          isOpen={this.state.modalIsOpen}
          onRequestClose={this.closeModal}>
          <div className="wrapper pipelineModal">
            <span className="closeModal" onClick={this.closeModal}>close</span>
            <div className="partLeft">
              <h2>Examples</h2>
              <div>
                <h4>Datasets</h4>
                <ul>
                  {pipelines.map(function(pipeline) {
                    var id = pipeline.get('_id'),
                        name = pipeline.get('name');
                    return (
                      <li key={id}>
                        <button onClick={this.addPipeline.bind(null, id)}>{name}</button>
                      </li>
                    );
                  }, this)}
                </ul>
              </div>
            </div>
            <div className="partRight">
              <h2>Import</h2>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
});

module.exports = connect(mapStateToProps)(PipelineSidebar);
