import * as React from 'react';
import { connect } from 'react-redux';
import {State} from '../../store';
import {GroupRecord} from '../../store/factory/marks/Group';
import InteractionPreviewController from './InteractionPreviewController';
import InteractionWidget from './InteractionWidget'
import {MarkRecord} from '../../store/factory/Mark';
import {Map} from 'immutable';
import exportName from '../../util/exportName';

interface StateProps {
  groups: GroupRecord[]
  // names: {xScaleName: string, yScaleName: string, xFieldName: string, yFieldName: string}
}

interface OwnState {
  activeGroupId: number;
}

function mapStateToProps(state: State, ownProps): StateProps {
  const marks: Map<string, MarkRecord> = state.getIn(['vis', 'present', 'marks']);
  const groups = marks.filter((mark: MarkRecord) => {
    return mark.type === 'group';
  }).valueSeq().map((x: GroupRecord) => x).toArray();
  return {groups};
}
class InteractionPreviewContainer extends React.Component<StateProps, OwnState> {

  constructor(props) {
    super(props);

    this.state = {
      activeGroupId: null
    }
  }

  public setActiveGroup(groupId) {
    this.setState({activeGroupId: groupId});
  }

  public render() {

    const InteractionControllers = this.props.groups.map((group) => {
      return <InteractionPreviewController className={group._id === this.state.activeGroupId ? 'active' : ''} key={group._id} groupId={group._id} groupName={exportName(group.name) setActiveGroup={this.setActiveGroup.bind(null, group._id)}}></InteractionPreviewController>;
    });

    return (
      <React.Fragment>
        <InteractionWidget></InteractionWidget>
        {InteractionControllers}
      </React.Fragment>
    )

  }

}

export default connect(mapStateToProps)(InteractionPreviewContainer);
