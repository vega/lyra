import {Map} from 'immutable';
import * as React from 'react';
import {connect} from 'react-redux';
import {State} from '../../store';
import {PipelineRecord} from '../../store/factory/Pipeline';
import {PipelineInspector} from './PipelineInspector';

const getInVis = require('../../util/immutable-utils').getInVis;

interface Props {
  pipelines: Map<number, PipelineRecord>;
}

function mapState(state: State): Props {
  return {
    pipelines: getInVis(state, 'pipelines')
  };
}

class BasePipelineList extends React.Component<Props> {
  public render() {
    const pipelines = this.props.pipelines.keySeq().toArray();

    return (
      <div id='pipeline-list'>
        {pipelines.map(function(id) {
          return (<PipelineInspector key={id} id={id} />);
        })}
      </div>
    );
  }
}

export const PipelineList = connect(mapState)(BasePipelineList);
