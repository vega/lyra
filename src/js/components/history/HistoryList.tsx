import {Map} from 'immutable';
import * as React from 'react';
import {connect} from 'react-redux';
import {selectHistory} from '../../actions/inspectorActions';
import {updateHistoryProperty as updateHistory} from '../../actions/historyActions';
import {State} from '../../store';
import {HistoryRecord} from '../../store/factory/History';
import {Icon} from '../Icon';
import {HistoryItem} from './HistoryItem';
import {MarkRecord} from '../../store/factory/Mark';
import {GroupRecord} from '../../store/factory/marks/Group';

const getIn = require('../../util/immutable-utils').getIn;
const ContentEditable = require('../ContentEditable');
const assets = require('../../util/assets');

interface OwnProps {
}
interface StateProps {
  history: any[];
  selectedId: number;

  groupNames: any[];
}

interface DispatchProps {
  selectHistory: (id: number) => void;
  updateHistory: (payload: {property: string, value: any}, id: number) => void;
}

function mapState(state: State): StateProps {
  let groupNames = []
  const marks: Map<string, MarkRecord> = state.getIn(['vis', 'present', 'marks']);
  const groups = marks.filter((mark: MarkRecord) => {
    return mark.type === 'group';
  }).map((v) => {
    groupNames.push(v.name.replace(" ", "_"));
  });
  let history = [...getIn(state, 'vis').past];
  history.push(getIn(state, 'vis').present);
  return {
    history,
    selectedId: state.getIn(['inspector', 'history', 'selectedId']),
    groupNames: groupNames
  };
}

const mapDispatch: DispatchProps = {
  selectHistory,
  updateHistory
};

class BaseHistoryList extends React.Component<OwnProps & StateProps & DispatchProps> {
  public render() {

    return (
      <div id='history-list' >
        {this.props.history.map(
           (item, idx) => {
            return <HistoryItem id={idx+''} key={idx+''} history={item} groupNames={this.props.groupNames} />
          }
        )}
      </div>
    );
  }
}

export const HistoryList = connect(mapState, mapDispatch)(BaseHistoryList);
