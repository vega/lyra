import * as React from 'react';
import * as ReactModal from 'react-modal';
import { connect } from 'react-redux';
import * as WActions from '../../actions/walkthroughActions';
import {State} from '../../store';
import {WalkthroughName} from '../../store/factory/Walkthrough';
import {WalkthroughData} from '../../walkthrough';
import { Icon } from '../Icon';

const getIn = require('../../util/immutable-utils').getIn;
const assets = require('../../util/assets');

interface StateProps {
  walkthroughs: WalkthroughData;
}

interface DispatchProps {
  select: (key: WalkthroughName) => void;
}

interface OwnState {
  modalIsOpen: boolean;
}

function mapStateToProps(reduxState: State): StateProps {
  return {
    walkthroughs: getIn(reduxState, 'walkthrough.data')
  };
}

const mapDispatch: DispatchProps = {
  select: WActions.setActiveWalkthrough
}

class WalkthroughMenu extends React.Component<StateProps & DispatchProps, OwnState> {

  constructor(props) {
    super(props);

    this.state = {
      modalIsOpen: false
    };
  };

  public selectWalkthrough(key) {
    this.props.select(key);
    this.closeModal();
  }

  public openModal() {
    this.setState({modalIsOpen: true});
  }

  public closeModal() {
    this.setState({modalIsOpen: false});
  }

  public getWalkthroughDetails() {
    const walkD = this.props.walkthroughs;
    const walkthroughs = [];
    for (const key of Object.keys(walkD)) {
      walkD[key].key = key;
      walkthroughs.push(walkD[key]);
    }
    return walkthroughs;
  }

  private classNames = 'hints walkthroughMenu ';

  public render() {
    return (
      <div>
        <a onClick={this.openModal}>Walkthroughs</a>
        <ReactModal
          isOpen={this.state.modalIsOpen}
          onRequestClose={this.closeModal}
          contentLabel='Walkthrough Modal'>
            <div className ='wrapper walkthrough-menu'>
              <span className='closeModal' onClick={this.closeModal}>
                <Icon glyph={assets.close} />
              </span>
              <h2 className='hed'>Select a walkthrough</h2>
              <p>
                Learn to use lyra with step by step guides.
                You can quit them at any time to explore on your own.
              </p>
              <ul>
                {this.getWalkthroughDetails().map(function(wk, i) {
                  const thumbnail = wk.image ? (<img src={wk.image}/>) : null;
                  return (
                    <li key={i} onClick={this.selectWalkthrough.bind(this, wk.key)}>
                      {thumbnail}
                      <span>{wk.title}</span>
                    </li>
                  );
                }, this)}
              </ul>
            </div>
          </ReactModal>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatch)(WalkthroughMenu);
