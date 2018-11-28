import * as React from 'react';
import {PipelineList} from './pipelines/PipelineList';

const assets = require('../util/assets');
const Icon = require('./icon');
const PipelineModal = require('./pipelines/PipelineModal').connected;

export class PipelinesSidebar extends React.PureComponent<{}, {modalIsOpen: boolean}> {
  constructor(props) {
    super(props);
    this.state = {modalIsOpen: false};
  }

  private openModal = () => this.setState({modalIsOpen: true})
  private closeModal = () => this.setState({modalIsOpen: false})

  public render() {
    return (
      <div className='sidebar' id='pipeline-sidebar'>
        <h2>Data Pipelines
          <span className='new' onClick={this.openModal}>
            <Icon glyph={assets.plus} /> New
          </span>
        </h2>

        <PipelineList />

        <PipelineModal modalIsOpen={this.state.modalIsOpen}
          closeModal={this.closeModal} />
      </div>
    );
  }
}
