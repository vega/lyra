const imutils = require('../../util/immutable-utils');
const getIn = imutils.getIn;
const getInVis = imutils.getInVis;

import * as React from 'react';
import {connect} from 'react-redux';
import { Dispatch } from 'redux';
import {resetMarkVisual} from '../../actions/markActions';
import {PrimType} from '../../constants/primTypes';
import {State} from '../../store';
import {DraggingStateRecord} from '../../store/factory/Inspector';
import {AutoComplete} from './AutoComplete';
import {FormInputProperty} from './FormInputProperty';

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
}

interface StateProps {
  group?:  any;
  signal?: any;
  value?: string|number|boolean|any; // TODO: remove 'any', add Immutable.Map type
  field?:  any;
  scale?:  any;
  srcField?:  any;
  scaleName?: any;
  dragging?: DraggingStateRecord
}

interface DispatchProps {
  unbind?: () => void;
}

function mapStateToProps(reduxState: State, ownProps: OwnProps): StateProps {
  if (!ownProps.primId) {
    return {};
  }

  const state = getInVis(reduxState, ownProps.primType + '.' + ownProps.primId);
  let path;
  let dsId;

  if (ownProps.name) {
    if (ownProps.primType === PrimType.MARKS) {
      path = 'encode.update.' + ownProps.name;
      dsId = getIn(state, 'from.data');
    } else {
      path = ownProps.name;
    }
  }

  const scale = getIn(state, path + '.scale');
  const field = getIn(state, path + '.field');
  const scaleName = scale && getInVis(reduxState, 'scales.' + scale + '.name');

  const value = getIn(state, path);

  return {
    group:  getIn(state, path + '.group'),
    signal: getIn(state, path + '.signal'),
    value:  value !== null ? value : ownProps.value,
    field:  field,
    scale:  scale,
    srcField:  dsId && field ?
      getInVis(reduxState, 'datasets.' + dsId + '._schema.' + field + '.source') : false,
    scaleName: scaleName,
    dragging: reduxState.getIn(['inspector', 'dragging'])
  };
}

function mapDispatchToProps(dispatch: Dispatch, ownProps: OwnProps): DispatchProps {
  return {
    unbind: function() {
      dispatch(resetMarkVisual(ownProps.name, ownProps.primId));
    }
  };
}

class BaseProperty extends React.Component<OwnProps & StateProps & DispatchProps, OwnState> {
  constructor(props) {
    super(props);
    this.state = {dragOver: 0};
  };

  public render() {
    const props = this.props;
    const name  = props.name;
    const label = props.label;
    const type  = props.type;
    const scale = props.scale;
    const field = props.field;
    const unbind = props.unbind;
    let dragOver = this.state.dragOver;
    let labelEl;
    let scaleEl;
    let controlEl;
    let extraEl;

    React.Children.forEach(props.children, function(child: JSX.Element) {
      const className = child && child.props.className;
      if (className === 'extra') {
        extraEl = child;
      } else if (className === 'control') {
        controlEl = child;
      } else if (type === 'label' || (className && className.indexOf('label') !== -1)) {
        labelEl = child;
      }
    });

    labelEl = labelEl || (<label htmlFor={name}>{label}</label>);
    scaleEl = scale ?
      (<div className='scale' onClick={unbind}>{props.scaleName}</div>) : null;

    controlEl = field ?
      (<div className={'field ' + (props.srcField ? 'source' : 'derived')}
        onClick={unbind}>{field}</div>) : controlEl;

    if (!controlEl) {
      switch (type) {
        case 'autocomplete':
          controlEl = (
            <AutoComplete type={props.autoType} updateFn={props.onChange}
              value={props.value} dsId={props.dsId}
              primId={props.primId} primType={props.primType} />
          );
          break;
        default:
          controlEl = (
            <FormInputProperty {...props as any} />
          );
      }
    }

    if (extraEl) {
      extraEl = (<div className='extra'>{extraEl}</div>);
    }

    const className = 'property' +
      (props.droppable && props.dragging ? ' droppable' : '') +
      (props.droppable && dragOver ? ' drag-over' : '') +
      (props.firstChild ? ' first-child' : '');

    return (
      <div className={className}
        onDragEnter={() => this.setState({dragOver: ++dragOver})}
        onDragLeave={() => this.setState({dragOver: --dragOver})}>
        {labelEl}
        <div className='control'>
          {scaleEl}
          {controlEl}
        </div>
        {extraEl}
      </div>
    );
  }
};
export const Property = connect(mapStateToProps, mapDispatchToProps)(BaseProperty);
