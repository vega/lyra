import * as React from 'react';
import { connect } from 'react-redux';
import {State} from '../../store';
import {GroupRecord} from '../../store/factory/marks/Group';
import InteractionPreviewController from './InteractionPreviewController';
import {MarkRecord} from '../../store/factory/Mark';
import {Map} from 'immutable';

interface StateProps {
  groups: number[]
  // names: {xScaleName: string, yScaleName: string, xFieldName: string, yFieldName: string}
}

function mapStateToProps(state: State, ownProps): StateProps {
  const marks: Map<string, MarkRecord> = state.getIn(['vis', 'present', 'marks']);
  const groups = marks.filter((mark: MarkRecord) => {
    return mark.type === 'group';
  }).valueSeq().map((x: GroupRecord) => x._id).toArray();
  return {groups};
}
class InteractionPreviewContainer extends React.Component<StateProps> {

  constructor(props) {
    super(props);
  }

  public componentDidUpdate(prevProps: StateProps, prevState) {
  }
  public render() {

    return (
      this.props.groups.map((id: number) => {
        return <InteractionPreviewController key={id} groupId={id}></InteractionPreviewController>;
      })
    );
  }

}

export default connect(mapStateToProps)(InteractionPreviewContainer);
