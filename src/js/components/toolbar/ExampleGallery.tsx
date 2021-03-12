import * as React from 'react';
import * as ReactModal from 'react-modal';
import {connect} from 'react-redux';
import {Icon} from '../Icon';
import {hydrate} from '../../ctrl/persist';

const assets = require('../../util/assets');
const examples = require('../../constants/examples');

export interface OwnState {
  isModalOpen: boolean;
}

const style = {
  overlay: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  content: {
    // position: null,
    overflow: 'hidden',
    top: null, bottom: null, left: null, right: null,
    padding: '15px'
  }
};

interface DispatchProps {
  hydrate: (str: string) => void
}

class BaseExampleGallery extends React.Component<DispatchProps, OwnState> {

  constructor(props) {
    super(props);
    this.state = {
      isModalOpen: false
    };
  }

  private close() {
    this.setState({
      isModalOpen: false
    })
  }

  private open() {
    this.setState({
      isModalOpen: true
    })
  }

  private loadState(state) {
    this.props.hydrate(JSON.stringify(state));
    this.close();
  }

  public render() {
    const state = this.state;

    return (

      <ul className="examples-button">
        <li onClick={() => this.open()}>
          <Icon glyph={assets.book} width='18' /> Examples
        </li>

        <ReactModal isOpen={state.isModalOpen} onRequestClose={() => this.close()} contentLabel='Examples Modal' style={style}>
          <div className='examplesModal'>
            <span className='closeModal' onClick={() => this.close()}>close</span>

            <h2>Example Gallery</h2>
            <div>
              {
                examples.map(example => {
                  return (
                    <div className='example-gallery-entry' key={example.name}>
                      <img src={example.img} width={200}/>
                      <h5>{example.name}</h5>
                      <ul>
                        <li><a href={example.documentation} target='_blank'>Vega documentation</a></li>
                        <li onClick={() => this.loadState(example.state)}>Load visualization</li>
                        <li>Walkthrough video</li>
                      </ul>
                    </div>
                  )
                })
              }
            </div>
          </div>
        </ReactModal>
      </ul>
    );
  }
}

export const ExampleGallery = connect(null, {hydrate})(BaseExampleGallery);
