import * as React from 'react';
import * as ReactModal from 'react-modal';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import {hintsOn as hints} from '../../actions/hintActions';
import {State} from '../../store';
import { Icon } from '../Icon';

const assets = require('../../util/assets');

interface StateProps {
  hintsOn: boolean
}

interface DispatchProps {
  toggleHints: () => void;
}

interface OwnState {
  modalIsOpen: boolean
}

function mapStateToProps(reduxState: State): StateProps {
  return {
    hintsOn: reduxState.getIn(['hints', 'on'])
  };
}

function mapDispatchToProps(dispatch: Dispatch, ownProps): DispatchProps {
  return {
    toggleHints: function() {
      dispatch(hints(!this.props.selected));
    }
  };
}

class Settings extends React.Component<StateProps & DispatchProps, OwnState> {

  constructor(props) {
    super(props);

    this.state = {
      modalIsOpen: false
    };
  };

  public openModal() {
    this.setState({modalIsOpen: true});
  }

  public closeModal() {
    this.setState({modalIsOpen: false});
  }

  public render() {
    return (
      <div>
        <a onClick={this.openModal}>Settings</a>
        <ReactModal
          isOpen={this.state.modalIsOpen}
          onRequestClose={this.closeModal}
          contentLabel='Settings Modal'>
            <div className ='wrapper settings'>
              <span className='closeModal' onClick={this.closeModal}>
                <Icon glyph={assets.close} />
              </span>
              <h2 className='hed'>Settings</h2>
                <label className='label-inline'>Hints: </label>
                <div className='onoffswitch inline'>
                  <input type='checkbox'
                    name='onoffswitch'
                    className='onoffswitch-checkbox'
                    id='myonoffswitch'
                    defaultChecked={this.props.hintsOn}
                    onChange={this.props.toggleHints.bind(this, '')}/>
                  <label className='onoffswitch-label' htmlFor='myonoffswitch'>
                    <span className='onoffswitch-inner' />
                    <span className='onoffswitch-switch' />
                  </label>
                </div>
            </div>
          </ReactModal>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
