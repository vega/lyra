'use strict';

const Immutable = require('immutable');
const FormInputProperty = require('./FormInputProperty');
const AutoComplete = require('./AutoComplete');
const imutils = require('../../util/immutable-utils');
const getIn = imutils.getIn;
const getInVis = imutils.getInVis;
const TYPES = require('../../constants/primTypes');
const resetMarkVisual = require('../../actions/markActions').resetMarkVisual;

import * as React from 'react';
import {connect} from 'react-redux';
import { Dispatch } from 'redux';
import {State} from '../../store';

function mapStateToProps(reduxState: State, ownProps) {
  if (!ownProps.primId) {
    return {};
  }

  const state = getInVis(reduxState, ownProps.primType + '.' + ownProps.primId);
  let path;
  let dsId;

  if (ownProps.name) {
    if (ownProps.primType === TYPES.MARKS) {
      path = 'properties.update.' + ownProps.name;
      dsId = getIn(state, 'from.data');
    } else {
      path = ownProps.name;
    }
  }

  const scale = getIn(state, path + '.scale');
  const field = getIn(state, path + '.field');
  const scaleName = scale && getInVis(reduxState, 'scales.' + scale + '.name');

  return {
    group:  getIn(state, path + '.group'),
    signal: getIn(state, path + '.signal'),
    value:  getIn(state, path),
    field:  field,
    scale:  scale,
    srcField:  dsId && field ?
      getInVis(reduxState, 'datasets.' + dsId + '._schema.' + field + '.source') : false,
    scaleName: scaleName
  };
}

function mapDispatchToProps(dispatch: Dispatch, ownProps) {
  return {
    unbind: function() {
      dispatch(resetMarkVisual(ownProps.primId, ownProps.name));
    }
  };
}

interface PropertyProps {
  name: string;
  label: string;
  field: string;
  group: string;
  scale: number;
  dsId: number;
  scaleName: string;
  signal: string;
  autoType: string;
  onChange: () => any;
  value: string|number|boolean|any; // TODO: remove 'any', add Immutable.Map type
  unbind: () => any;
  type: any;
  srcField: any;
  firstChild: any;
  canDrop: any;

}

class Property extends React.Component<PropertyProps> {
  public render() {
    const props = this.props;
    const name  = props.name;
    const label = props.label;
    const type  = props.type;
    const scale = props.scale;
    const field = props.field;
    const unbind = props.unbind;
    let labelEl;
    let scaleEl;
    let controlEl;
    let extraEl;

    React.Children.forEach(props.children, function(child) {
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
              value={props.value} dsId={props.dsId}/>
          );
          break;
        default:
          controlEl = (
            <FormInputProperty {...props} />
          );
      }
    }

    if (extraEl) {
      extraEl = (<div className='extra'>{extraEl}</div>);
    }

    const className = 'property' + (props.canDrop ? ' can-drop' : '') +
      (props.firstChild ? ' first-child' : '');

    return (
      <div className={className}>
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

export default connect(mapStateToProps, mapDispatchToProps)(Property);
