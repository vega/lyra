import * as React from 'react';
import {PipelineList} from './pipelines/PipelineList';
import PipelineModal from './pipelines/PipelineModal';

export class PipelinesToolbar extends React.PureComponent<{}, {modalIsOpen: boolean}> {
  constructor(props) {
    super(props);
    this.state = {modalIsOpen: false};
  }

  private openModal = () => this.setState({modalIsOpen: true})
  private closeModal = () => this.setState({modalIsOpen: false})

  public render() {
    return (
      <div id='pipeline-toolbar'>
        <h2>Data Pipelines</h2>

        <PipelineList openModal={this.openModal} />

        <PipelineModal modalIsOpen={this.state.modalIsOpen}
          closeModal={this.closeModal} />
      </div>
    );
  }
}
