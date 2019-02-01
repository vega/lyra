import * as React from 'react';
import {connect} from 'react-redux';
import {State} from '../../store';
import {PipelineRecord} from '../../store/factory/Pipeline';
import { Icon } from '../Icon';
import DataTable from './DataTable';

const ContentEditable = require('../ContentEditable');
const selectPipeline = require('../../actions/inspectorActions').selectPipeline;
const updatePipeline = require('../../actions/pipelineActions').updatePipelineProperty;
const imutils = require('../../util/immutable-utils');
const getIn = imutils.getIn;
const getInVis = imutils.getInVis;
const assets = require('../../util/assets');

interface OwnProps {
  id: number;
}

interface StateProps {
  isSelected: boolean;
  pipeline: PipelineRecord;
}

function mapState(state: State, ownProps: OwnProps): StateProps {
  const id = ownProps.id;
  return {
    isSelected: getIn(state, 'inspector.pipelines.selectedId') === id,
    pipeline: getInVis(state, 'pipelines.' + id)
  };
}

const actionCreators = {selectPipeline, updatePipeline};

class BasePipelineInspector extends React.Component<OwnProps & StateProps & typeof actionCreators> {
  public render() {
    const props = this.props;
    const pipeline = props.pipeline;
    const id = props.id;
    const name = pipeline.name;
    let inner;

    if (props.isSelected) {
      inner = (
        <div className='inner'>
          <p className='source'>
            <Icon glyph={assets.download} width={11} height={11} />
            Loaded Values
          </p>

          <DataTable id={pipeline._source} />

          {pipeline._aggregates.entrySeq().map(function(entry, i) {
            return (
              <div key={i}>
                <p className='source'>Group By: {entry[0].split('|').join(', ')}</p>
                <DataTable id={entry[1]} />
              </div>
            );
          })}
        </div>
      );
    }

    return (
      <div className={'pipeline' + (props.isSelected ? ' selected' : '')}>
        <ContentEditable className='header'
          value={name}
          save={props.updatePipeline.bind(this, id, 'name')}
          onClick={props.selectPipeline.bind(null, id)} />
        {inner}

      </div>
    );
  }
}

export const PipelineInspector = connect(mapState, actionCreators)(BasePipelineInspector);
