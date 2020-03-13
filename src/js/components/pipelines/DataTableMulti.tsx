import TransformList from './transforms/TransformList';

import * as React from 'react';
import { connect } from 'react-redux';
import {State} from '../../store';
import {DatasetRecord} from '../../store/factory/Dataset';

import { throttle } from "throttle-debounce";
import DataTable from './DataTable';

const getInVis = require('../../util/immutable-utils').getInVis;

interface OwnProps {
  id: number;
  fieldsCount: number; // how many fields per DataTable?
}
interface StateProps {
  dataset: DatasetRecord;
}

interface OwnState {
  page: number;
  scroll: number;
}

function mapStateToProps(state: State, ownProps: OwnProps): StateProps {
  const id = ownProps.id;
  return {
    dataset: getInVis(state, 'datasets.' + id)
  };
}

class DataTableMulti extends React.Component<OwnProps & StateProps & {className?: string}, OwnState> {

  constructor(props) {
    super(props);

    this.state = {
      page: 0,
      scroll: 0
    }
  }

  private onPage(newPage) {
    this.setState({
      page: newPage
    });
  }

  private onScroll(newScroll) {
    if (newScroll !== this.state.scroll) {
      this.setState({
        scroll: newScroll
      });
    }
  }

  public render() {
    const props = this.props;
    const id = props.id;
    const schema = props.dataset.get('_schema');
    const keys = schema.keySeq().toArray();

    const dataTables = [];

    for (let i = 0; i <= keys.length / props.fieldsCount; i++) {
      dataTables.push(<DataTable key={i} id={this.props.id} fieldsIndex={i} fieldsCount={this.props.fieldsCount} limit={20} page={this.state.page} onPage={(p) => this.onPage(p)} scroll={this.state.scroll} onScroll={throttle(250, (s) => this.onScroll(s))}/>);
    }

    dataTables.push(
      <div key='TransformList' className='datatable-container'>
        <TransformList dsId={id} />
      </div>);

    return (<div className='datatable-multi'>{dataTables}</div>);
  }

}

export default connect(mapStateToProps)(DataTableMulti);
