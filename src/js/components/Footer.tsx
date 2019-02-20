import * as React from 'react';
import * as ReactModal from 'react-modal';
import Settings from './settings/SettingsModal';
import Walkthroughs from './walkthrough/Menu';

interface OwnState {
  modalIsOpen: boolean;
}

export class Footer extends React.Component<{}, OwnState> {
  constructor(props) {
    super(props);

    this.state = { modalIsOpen: false };
  };

  public openModal() {
    this.setState({modalIsOpen: true});
  }

  public closeModal() {
    this.setState({modalIsOpen: false});
  }

  private classNames = 'site-footer';

  public render() {
    return (
      <footer className={this.classNames}>
        <ul>
          <li onClick={this.openModal}>About</li>
          <li><a href='https://github.com/vega/lyra'>Github</a></li>
          <li>
            <Walkthroughs/>
          </li>
          <li>
            <Settings/>
          </li>
        </ul>
        <ReactModal
          isOpen={this.state.modalIsOpen}
          onRequestClose={this.closeModal}
          contentLabel='About Modal'>
          <div className ='wrapper'>
            <span className='closeModal' onClick={this.closeModal}>close</span>
            <h2>About the team... </h2>

            <div>I am a modal</div>
          </div>
        </ReactModal>
      </footer>
    );
  }
}
