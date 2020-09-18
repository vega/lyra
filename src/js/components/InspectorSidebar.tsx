/* eslint no-unused-vars:0 */
// From is being used
'use strict';

import * as React from 'react';
import {connect} from 'react-redux';
import {getType} from 'typesafe-actions';
import * as inspectorActions from '../actions/inspectorActions';
import {PrimType} from '../constants/primTypes';
import {State} from '../store';
import {EncodingStateRecord} from '../store/factory/Inspector';
import {AreaInspector} from './inspectors/Area';
import {GuideInspector} from './inspectors/Guide';
import {LineInspector} from './inspectors/Line';
import {RectInspector} from './inspectors/Rect';
import {ScaleInspector} from './inspectors/Scale';
import {InteractionInspector} from './inspectors/Interaction';
import {WidgetInspector} from './inspectors/Widget';
import {SymbolInspector} from './inspectors/Symbol';
import {TextInspector} from './inspectors/Text';

const inspectors = {AreaInspector, GuideInspector, LineInspector,
  RectInspector, ScaleInspector, SymbolInspector, TextInspector, InteractionInspector, WidgetInspector,
  GroupInspector: RectInspector};

interface Inspector {
  selectedId: number,
  isMark: boolean,
  isGuide: boolean,
  isScale: boolean,
  isInteraction: boolean,
  isWidget: boolean,
  name: string,
  from: string,
  markType: string,
  guideType: string,
  interactionList: string[],
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
  const isInteraction = selType === getType(inspectorActions.selectInteraction);
  const isWidget = selType === getType(inspectorActions.selectWidget);

  const primitive = isMark ? getInVis(state, `marks.${selId}`) :
    isGuide ? getInVis(state, `guides.${selId}`) :
    isScale ? getInVis(state, `scales.${selId}`) :
    isInteraction ? getInVis(state, `interactions.${selId}`) :
    isWidget ? getInVis(state, `widgets.${selId}`) : null;

  let from, interactions = [];
  if(isMark) {
    interactions = getInVis(state, 'interactions');
    interactions = [...interactions.values()];
    interactions = interactions.filter(i => primitive._parent == i.get('groupId')).map(i => i.get('name'));
  }
  if (primitive && primitive.from && primitive.from.data) {
    from = getInVis(state, 'pipelines.' +
        getInVis(state, 'datasets.' + primitive.from.data).get('_parent')).get('name');
  }

  return {
    selectedId: selId,
    isMark,
    isGuide,
    isScale,
    isInteraction,
    isWidget,
    name: primitive && primitive.get('name'),
    from,
    markType:  primitive && primitive.get('type'),
    guideType: primitive && primitive.get('_gtype'),
    interactionList: interactions
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
      } else if (props.isInteraction) {
        ctor = 'Interaction';
        primType = PrimType.INTERACTIONS;
      } else if (props.isWidget) {
        ctor = 'Widget';
        primType = PrimType.WIDGETS;
      }
      InspectorType = inspectors[ctor + 'Inspector'];
    }

    const pipeline = props.isMark ? (
      <div className='property-group property'>
        <h3 className='label-long'>Pipeline</h3>
        <div className='control'>{from || 'None'}</div>
      </div>
    ) : null;

    const linkedInteractions = this.props.interactionList.length && props.isMark ? (
      <div className='property-group'>
        <h3 className='label-long'>Interactions</h3>
        <div className='property'>
          {this.props.interactionList.length ?
            this.props.interactionList.map(interaction => {
              return (
                <span key={interaction} className='interaction name'>{interaction}</span>
              )
            }) : null
          }
        </div>
      </div>
    ): null;

    const inner = InspectorType ? (
      <div className='inner'>
        {pipeline}
        <InspectorType primId={primId}
          primType={primType} guideType={props.guideType} />
          {linkedInteractions}
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
