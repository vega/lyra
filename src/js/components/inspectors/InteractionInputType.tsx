'use strict';

import * as React from 'react';
import {Map} from 'immutable';
import {connect} from 'react-redux';
import {State} from '../../store';
import {ApplicationRecord, MarkApplicationRecord, InteractionInput} from '../../store/factory/Interaction';
import {GroupRecord} from '../../store/factory/marks/Group';
import exportName from '../../util/exportName';
import {Dispatch} from 'redux';
import {setInput} from '../../actions/interactionActions';
import {MarkRecord} from '../../store/factory/Mark';
import {Property} from './Property';

interface OwnProps {
  interactionId: number;
  input: InteractionInput;
}

interface DispatchProps {
  setInput: (input: InteractionInput, id: number) => void;
}

const actionCreators = {setInput};

class BaseInteractionInputType extends React.Component<OwnProps & DispatchProps> {

  private onKeyboardKeydown(e):void {
    const keycode = e.which || e.keyCode;
    const key = keycode === 32 ? 'Space' : e.key;
    if (keycode !== this.props.input.keyboard) {
      this.props.setInput({...this.props.input, keyboard: keycode, _key: key}, this.props.interactionId);
    }
  }

  private onMouseValueChange(e):void {
    const value = e.target && e.target.value;
    if (value && value !== this.props.input.mouse) {
      this.props.setInput({...this.props.input, mouse: value}, this.props.interactionId);
    }
  }

  private mouseValueMap = {
    'drag': 'Drag',
    'click': 'Click',
    'hover': 'Hover'
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
              <input className='key-input' name='key-input' type="text" onKeyDown={(e) => this.onKeyboardKeydown(e)} value={this.props.input._key ? this.props.input._key : 'None'} />
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export const InteractionInputType = connect(null, actionCreators)(BaseInteractionInputType);

