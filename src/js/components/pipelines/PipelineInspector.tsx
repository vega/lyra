import * as React from 'react';
import {connect} from 'react-redux';
import {State} from '../../store';
import {PipelineRecord} from '../../store/factory/Pipeline';
import { Icon } from '../Icon';
import DataTable from './DataTable';
import DataTableMulti from './DataTableMulti';
import TransformList from './transforms/TransformList';

const imutils = require('../../util/immutable-utils');
const getInVis = imutils.getInVis;
const assets = require('../../util/assets');

interface OwnProps {
  id: number;
  selectedId: number;
}

interface StateProps {
  pipeline: PipelineRecord;
}

function mapState(state: State, ownProps: OwnProps): StateProps {
  const id = ownProps.id;

  return {
    pipeline: getInVis(state, 'pipelines.' + id)
  };
}

class BasePipelineInspector extends React.Component<OwnProps & StateProps> {
  public render() {
    const props = this.props;
    const pipeline = props.pipeline;
    const id = props.id;
    let inner;

    const isSelected = +props.selectedId === +id;

    if (isSelected) {
      inner = (
        <div>
          {/* <p className='source'>
            <Icon glyph={assets.download} width={11} height={11} />
            Loaded Values
          </p> */}

          <DataTableMulti id={pipeline._source} fieldsCount={6} />

          {pipeline._aggregates.entrySeq().map(function(entry, i) {
            return (
              <div key={i} className="aggregate">
                <p className='source'>Group By: {entry[0].split('|').join(', ')}</p>
                <DataTableMulti id={entry[1]} fieldsCount={6} />
              </div>
            );
          })}
        </div>
      );
    }

    return (
      <div className={'pipeline' + (isSelected ? ' selected' : '')}>
        {inner}
      </div>
    );
  }
}

export const PipelineInspector = connect(mapState)(BasePipelineInspector);
