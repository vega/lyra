/* eslint no-unused-vars:0 */
// From is being used
'use strict';

import * as React from 'react';
import {connect} from 'react-redux';
import {State} from '../store';
import {EncodingStateRecord} from '../store/factory/Inspector';
import {AreaInspector} from './inspectors/Area';
import {GuideInspector} from './inspectors/Guide';
import {LineInspector} from './inspectors/Line';
import {RectInspector} from './inspectors/Rect';
import {ScaleInspector} from './inspectors/Scale';
import {SymbolInspector} from './inspectors/Symbol';
import {TextInspector} from './inspectors/Text';
import {PrimType} from '../constants/primTypes';
import * as inspectorActions from '../actions/inspectorActions';
import {getType} from 'typesafe-actions';

const inspectors = {AreaInspector, GuideInspector, LineInspector,
  RectInspector, ScaleInspector, SymbolInspector, TextInspector,
  GroupInspector: RectInspector};

interface Inspector {
  selectedId: number,
  isMark: boolean,
  isGuide: boolean,
  isScale: boolean,
  name: string,
  from: string,
  markType: string,
  guideType: string
}

const capitalize = require('capitalize');
const imutils  = require('../util/immutable-utils');
const getInVis = imutils.getInVis;

function mapStateToProps(state: State, ownProps): Inspector {
  const encState: EncodingStateRecord = state.getIn(['inspector', 'encodings']);
  const selId   = encState.get('selectedId');
  const selType = encState.get('selectedType');
  const isMark  = selType === getType(inspectorActions.baseSelectMark);
  const isGuide = selType === getType(inspectorActions.selectGuide);
  const isScale = selType === getType(inspectorActions.selectScale);
  let primitive;
  let from;

  if (isMark) {
    primitive = getInVis(state, 'marks.' + selId);
  } else if (isGuide) {
    primitive = getInVis(state, 'guides.' + selId);
  } else if (isScale) {
    primitive = getInVis(state, 'scales.' + selId);
  }

  if (primitive && (from = primitive.get('from'))) {
    if ((from = from.get('data'))) {
      from = getInVis(state, 'pipelines.' +
          getInVis(state, 'datasets.' + from).get('_parent')).get('name');
    }
  }

  return {
    selectedId: selId,
    isMark:  isMark,
    isGuide: isGuide,
    isScale: isScale,
    name: primitive && primitive.get('name'),
    from: from,
    markType:  primitive && primitive.get('type'),
    guideType: primitive && primitive.get('_gtype')
  };
}

class BaseInspector extends React.Component<Inspector> {
  public render() {
    const  props  = this.props;
    const primId = props.selectedId;
    const from = props.from;
    let ctor;
    let primType: PrimType;
    let InspectorType;

    if (primId) {
      if (props.isMark && props.markType) {
        ctor = capitalize(props.markType);
        primType = PrimType.MARKS;
      } else if (props.isGuide) {
        ctor = 'Guide';
        primType = PrimType.GUIDES;
      } else if (props.isScale) {
        ctor = 'Scale';
        primType = PrimType.SCALES;
      }
      InspectorType = inspectors[ctor + 'Inspector'];
    }

    const pipeline = props.isMark ? (
      <div className='property-group property'>
        <h3 className='label-long'>Pipeline</h3>
        <div className='control'>{from || 'None'}</div>
      </div>
    ) : null;

    const inner = InspectorType ? (
      <div className='inner'>
        {pipeline}
        <InspectorType primId={primId}
          primType={primType} guideType={props.guideType} />
      </div>
    ) : null;

    const title = props.name || 'Properties';

    // if property is selected show the header
    return (
      <div className='sidebar' id='inspector'>
        <h2>{title}</h2>
        {inner}
      </div>
    );
  }
};

export const InspectorSidebar = connect(mapStateToProps)(BaseInspector);
