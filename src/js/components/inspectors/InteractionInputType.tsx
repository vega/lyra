'use strict';

import * as React from 'react';
import {connect} from 'react-redux';
import {InteractionInput} from '../../store/factory/Interaction';
import {setInput} from '../../actions/interactionActions';

interface OwnProps {
  interactionId: number;
  input: InteractionInput;
  initializeInteraction: (mouse) => void;
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
    const value: InteractionInput['mouse'] = e.target && e.target.value;
    if (!this.props.input || value && value !== this.props.input.mouse) {
      this.props.initializeInteraction(value);
    }
  }

  private mouseValueMap() {
    const map = {
      'drag': 'Drag',
      'click': 'Click',
      'mouseover': 'Hover'
    }
    if (!this.props.input) {
      map['none'] = 'Select an event';
    }
    return map;
  }

  private setHoverNearest(e) {
    const checked = e.target && e.target.checked;
    this.props.setInput({...this.props.input, nearest: checked}, this.props.interactionId);
  }

  public render() {
    const input = this.props.input;
    return (
      <div className='property-group'>
        <h3>Input Event</h3>
        <div className='property'>
          <label htmlFor='mouse-input'>Mouse</label>
          <div className='control'>
            <div>
              <select id='mouse-input' name='mouse-input' value={input ? input.mouse : 'none'}
                onChange={(e) => this.onMouseValueChange(e)}>
                {Object.entries(this.mouseValueMap()).map(([k, v]) => {
                  return (<option key={k} value={k}>{v}</option>);
                }, this)}
              </select>
            </div>
          </div>
        </div>
        {
          input && input.mouse === 'mouseover' ? (
            <div className='property'>
              <label htmlFor='nearest-input'>Nearest</label>
              <div className='control'>
                <div>
                  <input type='checkbox' name='nearest-input' checked={input.nearest}
                    onClick={(e) => this.setHoverNearest(e)} />
                </div>
              </div>
            </div>
          ) : null
        }
        {
          input ? (
            <div className='property'>
              <label htmlFor='key-input'>Keyboard</label>
              <div className='control'>
                <div>
                  <input ref={element=>(element||{} as any).onsearch=(e) => this.clearKeyboard()}
                    className='key-input' name='key-input' type="search" onKeyDown={(e) => this.onKeyboardKeydown(e)} value={input && input._key ? input._key : 'None'} />
                </div>
              </div>
            </div>
          ) : null
        }
      </div>
    );
  }
};

export const InteractionInputType = connect(null, actionCreators)(BaseInteractionInputType);

