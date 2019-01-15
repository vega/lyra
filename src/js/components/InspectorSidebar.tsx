/* eslint no-unused-vars:0 */
// From is being used
'use strict';

import * as React from 'react';
import {connect} from 'react-redux';

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

const Immutable = require('immutable'),
    capitalize = require('capitalize'),
    store = require('../store'),
    Property = require('./inspectors/Property'),
    imutils  = require('../util/immutable-utils'),
    getIn = imutils.getIn,
    getInVis = imutils.getInVis,
    hierarchy = require('../util/hierarchy'),
    findInItemTree = hierarchy.findInItemTree,
    ACTIONS = require('../actions/Names'),
    TYPES = require('../constants/primTypes'),
    propTypes = require('prop-types'),
    createReactClass = require('create-react-class');

function mapStateToProps(state, ownProps) {
  let encState = getIn(state, 'inspector.encodings'),
      selId   = encState.get('selectedId'),
      selType = encState.get('selectedType'),
      isMark  = selType === ACTIONS.SELECT_MARK,
      isGuide = selType === ACTIONS.SELECT_GUIDE,
      isScale = selType === ACTIONS.SELECT_SCALE,
      primitive, from;

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
    let props  = this.props,
        primId = props.selectedId,
        from = props.from,
        ctor, primType, InspectorType;

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

      // InspectorType = Inspector[ctor]; // TODO: This throws an error when uncommented
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

// BaseInspector.Line = require('./inspectors/Line');
// BaseInspector.Rect = require('./inspectors/Rect');
// BaseInspector.Symbol = require('./inspectors/Symbol');
// BaseInspector.Text = require('./inspectors/Text');
// BaseInspector.Area = require('./inspectors/Area');
// BaseInspector.Group = require('./inspectors/Rect');
// BaseInspector.Scale = require('./inspectors/Scale');
// BaseInspector.Guide = require('./inspectors/Guide');

export const InspectorSidebar = connect(mapStateToProps)(BaseInspector);
