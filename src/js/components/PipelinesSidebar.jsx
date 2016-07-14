'use strict';
var React = require('react'),
    PipelineList = require('./pipelines/PipelineList'),
    connect = require('react-redux').connect,
    getIn = require('../util/immutable-utils').getIn,
    assets = require('../util/assets'),
    Modal = require('react-modal'),
    Icon = require('./Icon');

function mapStateToProps(state, ownProps) {
  return {
    pipelines: getIn(state, 'pipelines')
  };
}

var PipelineSidebar = React.createClass({
  getInitialState: function() {
    return {
      modalIsOpen: false
    };
  },
  openModal: function() {
    this.setState({modalIsOpen: true});
  },
  closeModal: function() {
    this.setState({modalIsOpen: false});
  },
  render: function() {
    var props = this.props,
        pipelines = props.pipelines;

    return (
      <div className="sidebar" id="pipeline-sidebar">
        <h2>Data Pipelines
          <span className="new" onClick={this.openModal}>
            <Icon glyph={assets.plus} /> New
          </span>
        </h2>
        <Modal
          isOpen={this.state.modalIsOpen}
          onRequestClose={this.closeModal}>
          <div className="wrapper pipelineModal">
            <span className="closeModal" onClick={this.closeModal}>close</span>
            <h2>Pipelines</h2>

            <div className="partLeft">
              <h2>Examples</h2>
              <div>
                <h4>Datasets</h4>
                <ul className="default">
                  {pipelines.map(function(pipeline) {
                    return (
                      <li key={pipeline.toJS()._id}>
                        <button>{pipeline.toJS().name}</button>
                      </li>
                    );
                  })}
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
