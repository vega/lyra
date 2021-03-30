import {Map} from 'immutable';
import * as React from 'react';
import {connect} from 'react-redux';
import {updateHistoryProperty} from '../../actions/historyActions';
import {State} from '../../store';
import {HistoryItem} from './HistoryItem';
import {MarkRecord} from '../../store/factory/Mark';

const getIn = require('../../util/immutable-utils').getIn;

interface OwnProps {
}
interface StateProps {
  history: any[];
  groupNames: string[];
}

interface DispatchProps {
  updateHistoryProperty: (payload: {property: string, value: any}, id: number) => void;
}

function mapState(state: State): StateProps {
  const marks: Map<string, MarkRecord> = state.getIn(['vis', 'present', 'marks']);
  const groupNames = marks.filter((mark: MarkRecord) => {
    return mark.type === 'group';
  }).map((v) => {
    return v.name.replace(" ", "_");
  }).toList().toJSON();
  let history = [...getIn(state, 'vis').past];
  history.push(getIn(state, 'vis').present);
  return {
    history,
    groupNames: groupNames
  };
}

const mapDispatch: DispatchProps = {
  updateHistoryProperty
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
