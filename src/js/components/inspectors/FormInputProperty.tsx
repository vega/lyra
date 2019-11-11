const ContentEditable = require('../ContentEditable');
const getInVis = require('../../util/immutable-utils').getInVis;
const ctrl = require('../../ctrl');

import * as React from 'react';
import {connect} from 'react-redux';
import { Dispatch } from 'redux';
import {setSignal} from '../../actions/signalActions';
import {offSignal, onSignal} from '../../ctrl/listeners';
import sg from '../../ctrl/signals';
import {State} from '../../store';
import {Icon} from '../Icon';

interface OwnProps {
  id?: string;
  type?: 'number'|'range'|'color'|'select'|'text'|'checkbox'|'toggle'|'selection';
  min?: string;
  max?: string;
  disabled?: boolean|string;
  opts?: string[];
  signal?: string;
  onChange?: () => any; // TODO: find function in/out types
  onBlur?: () => any; // TODO: find function in/out types
  name?: any;
  group?: any;
  glyph?: any;
  glyphs?: any;
  step?: any;
  value?: any;
}
interface StateProps {
  value: string|number|boolean|any; // TODO(arlu): the any propTypes was Immutable.Map, not sure what it should be
}

interface DispatchProps {
  setSignal: (value: any) => any; // TODO: find function in/out types
}

function mapStateToProps(reduxState: State, ownProps: OwnProps): StateProps {
  const signal = ownProps.signal;
  return !signal ? {value: ownProps.value} : {
    value: getInVis(reduxState, 'signals.' + signal + '.value')
  };
}

function mapDispatchToProps(dispatch: Dispatch, ownProps: OwnProps): DispatchProps {
  const signal = ownProps.signal;
  return {
    setSignal: function(value) {
      if (signal) {
        dispatch(setSignal(value, signal));
      }
    }
  };
}

interface FormInputState {
  value: any;
}

class BaseFormInputProperty extends React.Component<OwnProps & StateProps & DispatchProps, FormInputState> {
  constructor(props) {
    super(props);
    this.state = {value: props.value};
  }

  public componentWillMount() {
    this.onSignal(false);
  };

  public componentWillReceiveProps(nextProps) {
    const prevProps = this.props;
    const prevSig = prevProps.signal;
    const nextSig = nextProps.signal;

    if (prevSig !== nextSig) {
      this.offSignal(prevSig);

      if (nextSig) {
        this.onSignal(nextSig);
      }
    }

    if (nextSig || nextProps.value !== prevProps.value) {
      this.setState({value: nextSig ? sg.get(nextSig) : nextProps.value});
    }
  };
  public componentWillUnmount() {
    this.offSignal(false);
  };

  public onSignal(signal) {
    signal = signal || this.props.signal;
    if (signal) {
      onSignal(signal, this.signal);
    }
  };

  public offSignal(signal) {
    signal = signal || this.props.signal;
    if (signal) {
      offSignal(signal, this.signal);
    }
  };

  public signal = (_, value) => {
    this.props.setSignal(value);
    this.setState({value: value});
  }

  public handleChange(evt) {
    const props = this.props;
    const type  = props.type;
    const signal = props.signal;
    let value  = evt.target ? evt.target.value : evt;

    // Ensure value is a number
    if (type === 'number' || type === 'range') {
      value = +value;
    }

    // Set the signal on the view but do not dispatch: the `.signal` listener
    // above will dispatch the action to synchronize Redux with Vega.
    if (signal) {
      sg.set(signal, value, false);
      ctrl.update();
    }

    this.setState({value});
  };

  public colorSupport() {
    const input = document.createElement('input');
    input.setAttribute('type', 'color');
    return input.type !== 'text';
  };

  public render() {
    const props = this.props;
    const name = props.name;
    const id  = props.id;
    const min = props.min;
    const max = props.max;
    const disabled = props.disabled || props.group;
    const value = !disabled ? this.state.value : '';
    const onChange = props.onChange || this.handleChange.bind(this);
    const onBlur = props.onBlur;
    const colorSupport = this.colorSupport();

    switch (props.type) {
      case 'checkbox':
        return (
          <input id={id} name={name} type='checkbox' checked={value}
            disabled={disabled} onChange={onChange} onBlur={onBlur} />
        );

      case 'text':
        return (
          <input id={id} name={name} type='text' value={value}
            disabled={disabled} onChange={onChange} onBlur={onBlur} />
        );

      case 'number':
        return (
          <input id={id} name={name} type='number' value={value}
            min={min} max={max} disabled={disabled}
            onChange={onChange} onBlur={onBlur} />
        );

      case 'range':
        return (
          <div>
            <input id={id} name={name} type='range' value={value}
              min={min} max={max} step={props.step}
              disabled={disabled} onChange={onChange} onBlur={onBlur} />

            <ContentEditable value={value} save={onChange} />
          </div>
        );

      case 'color':
        return (
          <div>
            <input id={id} name={name} type={colorSupport ? 'color' : 'text'}
              value={value} disabled={disabled} onChange={onChange} onBlur={onBlur} />

            {colorSupport ? (<ContentEditable value={value} save={onChange} />) : null}
          </div>
        );

      case 'select':
        return (
          <select id={id} name={name} value={value} disabled={disabled}
            onChange={onChange} onBlur={onBlur}>
            {props.opts.map(function(o) {
              return (<option key={o} value={o}>{o}</option>);
            }, this)}
          </select>
        );

      case 'toggle':
        const otherVal = props.opts.find(function(opt) {
          return opt !== value;
        });

        return (
          <div>
            <button type='button' id={id}
              className={(value === props.opts[0] ? '' : 'button-secondary ') + 'button'}
              onClick={onChange.bind(this, otherVal)}>
              <Icon glyph={props.glyph} />
            </button>
          </div>
        );

      case 'selection':
        return (
          <div>
            {props.opts.map(function(opt, idx) {
              return (
                <button key={opt} type='button' id={id}
                  className={(value === opt ? 'button-secondary ' : '') + 'button'}
                  onClick={onChange.bind(this, opt)}>
                  <Icon glyph={props.glyphs[idx]} />
                </button>
              );
            }, this)}
          </div>
        );

      default:
        return null;
    }
  }
};
export const FormInputProperty = connect(mapStateToProps, mapDispatchToProps)(BaseFormInputProperty);
