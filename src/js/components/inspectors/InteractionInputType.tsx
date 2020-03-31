'use strict';

import * as React from 'react';
import {connect} from 'react-redux';
import {InteractionInput} from '../../store/factory/Interaction';
import {setInput} from '../../actions/interactionActions';

interface OwnProps {
  interactionId: number;
  input: InteractionInput;
}

interface DispatchProps {
  setInput: (input: InteractionInput, id: number) => void;
}

const actionCreators = {setInput};

class BaseInteractionInputType extends React.Component<OwnProps & DispatchProps> {

  private onKeyboardKeydown(e) {
    const keycode = e.which || e.keyCode;
    const key = keycode === 32 ? 'Space' : e.key;
    if (keycode !== this.props.input.keycode) {
      this.props.setInput({...this.props.input, keycode: keycode, _key: key}, this.props.interactionId);
    }
    if (keycode === 13) {
      // prevent Enter interfering with clearKeyboard
      e.preventDefault();
      return false;
    }
  }

  private clearKeyboard() {
    this.props.setInput({...this.props.input, keycode: undefined, _key: undefined}, this.props.interactionId);
  }

  private onMouseValueChange(e) {
    const value = e.target && e.target.value;
    if (value && value !== this.props.input.mouse) {
      this.props.setInput({...this.props.input, mouse: value}, this.props.interactionId);
    }
  }

  private mouseValueMap = {
    'drag': 'Drag',
    'click': 'Click',
    'mouseover': 'Hover'
  }

  public render() {
    if (!this.props.input) {
      return null;
    }
    return (
      <div className='property-group'>
        <h3>Input Event</h3>
        <div className='property'>
          <label htmlFor='mouse-input'>Mouse</label>
          <div className='control'>
            <div>
              <select id='mouse-input' name='mouse-input' value={this.props.input.mouse}
                onChange={(e) => this.onMouseValueChange(e)}>
                {Object.entries(this.mouseValueMap).map(([k, v]) => {
                  return (<option key={k} value={k}>{v}</option>);
                }, this)}
              </select>
            </div>
          </div>
        </div>
        <div className='property'>
          <label htmlFor='key-input'>Keyboard</label>
          <div className='control'>
            <div>
              <input ref={element=>(element||{} as any).onsearch=(e) => this.clearKeyboard()}
                className='key-input' name='key-input' type="search" onKeyDown={(e) => this.onKeyboardKeydown(e)} value={this.props.input._key ? this.props.input._key : 'None'} />
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export const InteractionInputType = connect(null, actionCreators)(BaseInteractionInputType);

