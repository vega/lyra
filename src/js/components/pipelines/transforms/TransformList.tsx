'use strict';

import * as React from 'react';
import { connect } from 'react-redux';
import {State} from '../../../store';
import TransformInspector from './TransformInspector';

const Immutable = require('immutable');
const getInVis = require('../../../util/immutable-utils').getInVis;

interface OwnProps {
  dsId: number;
}
interface StateProps {
  transforms: any; // Immutable.List
}

function mapStateToProps(state: State, ownProps) {
  return {
    transforms: getInVis(state, 'datasets.' + ownProps.dsId + '.transform')
  };
}

export class TransformList extends React.Component<OwnProps & StateProps> {

  public render() {
    const props = this.props;
    const transforms = props.transforms;
    const aggregate  = transforms ? transforms.size === 1 &&
          transforms.first().get('type') === 'aggregate' : false;
    const dsId = props.dsId;

    return transforms && !aggregate ? (
      <div className='transform-list'>
        {transforms.map(function(transform, i) {
          return transform.get('type') === 'aggregate' ? null : (
            <TransformInspector key={i} index={i} dsId={dsId} def={transform} />
          );
        }, this)}
      </div>
    ) : null;
  }
}

export default connect(mapStateToProps)(TransformList);
