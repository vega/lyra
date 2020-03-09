import {Map} from 'immutable';
import * as React from 'react';
import {connect} from 'react-redux';
import {State} from '../../store';
import {PipelineRecord} from '../../store/factory/Pipeline';
import {PipelineInspector} from './PipelineInspector';

const getInVis = require('../../util/immutable-utils').getInVis;

interface OwnProps {
  openModal: () => void;
}
interface StateProps {
  pipelines: Map<number, PipelineRecord>;
}

function mapState(state: State): StateProps {
  return {
    pipelines: getInVis(state, 'pipelines')
  };
}

class BasePipelineList extends React.Component<OwnProps & StateProps> {
  public render() {
    const pipelines = this.props.pipelines.keySeq().toArray();

    return (
      <div id='pipeline-list'>
        {
          pipelines.length ?
            pipelines.map(function(id) {
              return (<PipelineInspector key={id} id={id} />);
            }) :
            <div id='pipeline-hint' onClick={this.props.openModal}>
              Add a new data pipeline to get started.
            </div>
        }
      </div>
    );
  }
}

export const PipelineList = connect(mapState)(BasePipelineList);
