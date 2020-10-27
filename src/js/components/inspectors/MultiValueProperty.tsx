const imutils = require('../../util/immutable-utils');

import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { resetMarkVisual } from '../../actions/markActions';
import { PrimType } from '../../constants/primTypes';
import { State } from '../../store';
import { DraggingStateRecord } from '../../store/factory/Inspector';
import { Property } from './Property';

interface OwnState {
  dragOver?: number;
}

// hunch: probably actually needs to be a bunch of different types anded to a base type
// instead of one type with everything optional
// but it would take a long time to figure out what the mutually exclusive fields are
interface OwnProps {
  primId?: number;
  primType?: PrimType;
  name?: string;
  label?: string;
  dsId?: number;
  autoType?: 'expr' | 'tmpl';
  onChange?: (value) => void;
  type?: string;
  firstChild?: boolean;
  droppable?: boolean;
  opts?: string[];
  value?: any;
  isField?: boolean;
  valueProperty?: string;
  processValue?: (value, props) => typeof value;
}

interface StateProps {
  group?: any;
  signal?: any;
  value?: string | number | boolean | any; // TODO: remove 'any', add Immutable.Map type
  field?: any;
  scale?: any;
  srcField?: any;
  scaleName?: any;
  dragging?: DraggingStateRecord;
}

interface DispatchProps {
  unbind?: () => void;
}

function mapStateToProps(reduxState: State, ownProps: OwnProps): StateProps {
  if (!ownProps.primId) {
    return {value: null};
  }

  const state = reduxState.getIn(['vis', 'present', ownProps.primType , String(ownProps.primId)]);
  let path;
  let dsId;

  if (ownProps.name) {
    if (ownProps.primType === PrimType.MARKS) {
      path = 'encode.update.' + ownProps.name;
      dsId = state.getIn(['from','data']);
    } else {
      path = ownProps.name;
    }
  }

  const scale = state.getIn([path, 'scale']);
  const field = state.getIn([path, 'field']);
  const scaleName = scale && reduxState.getIn(['vis', 'present','scales', String(scale), 'name']);

  const value = state.getIn([path]);

  return {
    group: state.getIn([path, 'group']),
    signal: state.getIn([path, 'signal']),
    value: value != null ? value : ownProps.value,
    field: field,
    scale: scale,
    srcField: dsId && field ?
      reduxState.getIn(['vis', 'present', 'datasets', dsId, '_schema', field, 'source']) : false,
    scaleName: scaleName,
    dragging: reduxState.getIn(['inspector', 'dragging'])
  };
}

function mapDispatchToProps(dispatch: Dispatch, ownProps: OwnProps): DispatchProps {
  return {
    unbind: function () {
      dispatch(resetMarkVisual(ownProps.name, ownProps.primId));
    }
  };
}

class BaseProperty extends React.Component<OwnProps & StateProps & DispatchProps, OwnState> {
  constructor(props) {
    super(props);
    this.state = { dragOver: 0 };
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

    let currVals = [...props.value];
    currVals.push(newVal);
    
    evt._isArray = true;
    evt._arrayValues = currVals;

    props.onChange(evt);
  };

  public handleUnBind(evt) {
    const props = this.props;
    let value = evt.target ? evt.target.dataset.value : evt;

    const unbindVal = props.processValue ? props.processValue(value, props) : value;

    let currVals = props.value.filter((val) => {
      if (props.valueProperty) {
        return val[props.valueProperty] !== unbindVal[props.valueProperty];
      } else {
        return val !== unbindVal;
      }
    });

    evt.target.name = props.name;
    evt._isArray = true;
    evt._arrayValues = currVals;

    props.onChange(evt);
  };

  public render() {
    const props = this.props;
    const isField = props.isField;
    const label = props.label;
    const valueProperty = props.valueProperty;
    let dragOver = this.state.dragOver;
    let labelEl = (<h3>{label}</h3>);
    let selectedValsEl = [];
    props.value.forEach( (item, index) => {
      selectedValsEl.push(isField ? 
        <div className="property" key={index}>
          <div className='label'>{index + 1}</div>
          <div className='control'>
            <div className='scale' data-value={valueProperty ? item[valueProperty] : item} onClick={(e) => this.handleUnBind(e)}>Field</div>
            <div className='field source' data-value={valueProperty ? item[valueProperty] : item}
              onClick={(e) => this.handleUnBind(e)}>{valueProperty ? item[valueProperty] : item}</div>
          </div>
        </div>
      : <div className="property" key={index}>
          <div className='label'>{index + 1}</div>
          <div className='control'>{valueProperty ? item[valueProperty] : item}</div>
        </div>);
    });
    
    const className = 'property' +
      (props.droppable && props.dragging ? ' droppable' : '') +
      (props.droppable && dragOver ? ' drag-over' : '') +
      (props.firstChild ? ' first-child' : '');

    return (
      <div className={className}
        onDragEnter={() => this.setState({ dragOver: ++dragOver })}
        onDragLeave={() => this.setState({ dragOver: --dragOver })}>
        {labelEl}
        {selectedValsEl}
        <Property {...props} label="Add" onChange={(e) => this.handleChange(e)}/>
      </div>
    );
  }
};
export const MultiValueProperty = connect(mapStateToProps, mapDispatchToProps)(BaseProperty);
