/* eslint no-unused-vars:0 */
// From is being used
'use strict';

import * as React from 'react';
import {connect} from 'react-redux';
import {State} from '../store';
import {EncodingStateRecord} from '../store/factory/Inspector';

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
const getIn = imutils.getIn;
const getInVis = imutils.getInVis;
const ACTIONS = require('../actions/Names');
const TYPES = require('../constants/primTypes');

function mapStateToProps(state: State, ownProps): Inspector {
  const encState: EncodingStateRecord = state.getIn(['inspector', 'encodings']);
  const selId   = encState.get('selectedId');
  const selType = encState.get('selectedType');
  const isMark  = selType === ACTIONS.SELECT_MARK;
  const isGuide = selType === ACTIONS.SELECT_GUIDE;
  const isScale = selType === ACTIONS.SELECT_SCALE;
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
  public Line = require('./inspectors/Line');
  public Rect = require('./inspectors/Rect');
  public Symbol = require('./inspectors/Symbol');
  public Text = require('./inspectors/Text');
  public Area = require('./inspectors/Area');
  public Group = require('./inspectors/Rect');
  public Scale = require('./inspectors/Scale');
  public Guide = require('./inspectors/Guide');

  public render() {
    const  props  = this.props;
    const primId = props.selectedId;
    const from = props.from;
    let ctor;
    let primType;
    let InspectorType;

    if (primId) {
      if (props.isMark && props.markType) {
        ctor = capitalize(props.markType);
        primType = TYPES.MARKS;
      } else if (props.isGuide) {
        ctor = 'Guide';
        primType = TYPES.GUIDES;
      } else if (props.isScale) {
        ctor = 'Scale';
        primType = TYPES.SCALES;
      }
      InspectorType = BaseInspector[ctor];
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
