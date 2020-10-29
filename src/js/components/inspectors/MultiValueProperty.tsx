import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { PrimType } from '../../constants/primTypes';
import { State } from '../../store';
import { Property } from './Property';

interface OwnState {
}

interface OwnProps {
  primId?: number;
  primType?: PrimType;
  name?: string;
  label?: string;
  onChange?: (value, arrayValues?) => void;
  onBlur?: (value, arrayValues?) => void;
  onKeyPress?: (value, arrayValues?) => void;
  type?: string;
  opts?: string[];
  value?: any;
  valueProperty?: string;
  processValue?: (value, props) => typeof value;
  subLabel?: string;
}

interface StateProps {
  group?: any;
  signal?: any;
  value?: string | number | boolean | any; // TODO: remove 'any', add Immutable.Map type
}

interface DispatchProps {
}

function mapStateToProps(reduxState: State, ownProps: OwnProps): StateProps {
  if (!ownProps.primId) {
    return {value: null};
  }

  const state = reduxState.getIn(['vis', 'present', ownProps.primType , String(ownProps.primId)]);
  let path = ownProps.name;

  return {
    group: state.getIn([path, 'group']),
    signal: state.getIn([path, 'signal']),
    value: ownProps.value === undefined ? state.getIn([path]) : undefined, // Not using || because value could be 0
  };
}

function mapDispatchToProps(dispatch: Dispatch, ownProps: OwnProps): DispatchProps {
  return {};
}

class BaseProperty extends React.Component<OwnProps & StateProps & DispatchProps, OwnState> {
  constructor(props) {
    super(props);
    this.state = {};
  };

  public handleChange(evt) {
    const props = this.props;
    const type = props.type;
    let value = evt.target ? evt.target.value : evt;

    // Ensure value is a number
    if (type === 'number' || type === 'range') {
      value = +value;
    }

    let newVal = props.processValue ? props.processValue(value, props) : value;

    let arrayValues = [...props.value];
    arrayValues.push(newVal);

    evt.target.name = props.name;
    props.onBlur ? props.onBlur(evt, arrayValues) : props.onKeyPress ? props.onKeyPress(evt, arrayValues) :  props.onChange(evt, arrayValues);
  };

  public handleUnBind(evt) {
    const props = this.props;
    let value = evt.target ? evt.target.dataset.value : evt;

    const unbindVal = props.processValue ? props.processValue(value, props) : value;

    let arrayValues = props.value.filter((val) => {
      if (props.valueProperty) {
        return val[props.valueProperty] !== unbindVal[props.valueProperty];
      } else {
        return val !== unbindVal;
      }
    });

    evt.target.name = props.name;
    props.onBlur ? props.onBlur(evt, arrayValues) : props.onKeyPress ? props.onKeyPress(evt, arrayValues) : props.onChange(evt, arrayValues);
  };

  public render() {
    const props = this.props;
    const label = props.label;
    const valueProperty = props.valueProperty;
    let labelEl = (<h3>{label}</h3>);
    let selectedValsEl = [];
    props.value.forEach( (item, index) => {
      selectedValsEl.push(
        <div className="property" key={index}>
          <div className='label'>{index + 1}</div>
          <div className='control'>
            <div className='scale' data-value={valueProperty ? item[valueProperty] : item} onClick={(e) => this.handleUnBind(e)}>{props.subLabel || 'value'}</div>
            <div className='field source' data-value={valueProperty ? item[valueProperty] : item}
              onClick={(e) => this.handleUnBind(e)}>{valueProperty ? item[valueProperty] : item}</div>
          </div>
        </div>
      );
    });

    return (
      <div>
        {labelEl}
        <div className='property'>
          {selectedValsEl}
          <Property {...props} label="Add" value='' onChange={props.onChange ? (e) => this.handleChange(e) : null} onBlur={props.onBlur ? (e) => this.handleChange(e) : null} onKeyPress={props.onKeyPress ? (e) => this.handleChange(e) : null} />
        </div>
      </div>
    );
  }
};
export const MultiValueProperty = connect(mapStateToProps, mapDispatchToProps)(BaseProperty);
