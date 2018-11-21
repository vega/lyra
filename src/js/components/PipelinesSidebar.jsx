'use strict';
var React = require('react'),
    PipelineList = require('./pipelines/PipelineList'),
    assets = require('../util/assets'),
    PipelineModal = require('./pipelines/PipelineModal').connected,
    Icon = require('./Icon'),
    createReactClass = require('create-react-class');

var PipelineSidebar = createReactClass({
  getInitialState: function() {
    return {modalIsOpen: false};
  },
  openModal: function() {
    this.setState({modalIsOpen: true});
  },
  closeModal: function() {
    this.setState({modalIsOpen: false});
  },
  render: function() {
    return (
      <div className="sidebar" id="pipeline-sidebar">
        <h2>Data Pipelines
          <span className="new" onClick={this.openModal}>
            <Icon glyph={assets.plus} /> New
          </span>
        </h2>

        <PipelineList />

        <PipelineModal modalIsOpen={this.state.modalIsOpen}
          closeModal={this.closeModal} />
      </div>
    );
  }
});

module.exports = PipelineSidebar;
