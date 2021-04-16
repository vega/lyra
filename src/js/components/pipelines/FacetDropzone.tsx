import * as React from 'react';
import { connect } from 'react-redux';
import {State} from '../../store';
import {FieldDraggingStateRecord} from '../../store/factory/Inspector';
import {getClosestGroupId} from '../../util/hierarchy';
const ctrl = require('../../ctrl');
interface StateProps {
  dragging: FieldDraggingStateRecord;
  groupId: number;
}

interface OwnProps {
  layoutOrientation: string
}
interface DispatchProps {
  facetField: (payload) => void;
}

function mapStateToProps(state: State): StateProps {
  const groupId = getClosestGroupId();

  const draggingRecord = state.getIn(['inspector', 'dragging']);
  const isFieldDrag = draggingRecord && (draggingRecord as FieldDraggingStateRecord).dsId;

  return {
    dragging: isFieldDrag ? draggingRecord : null,
    groupId
  };
}

function mapDispatchToProps(dispatch, ownProps: OwnProps): DispatchProps {
  return {
    facetField: () => {

    }
  }
}

class FacetDropzone extends React.Component<StateProps & OwnProps & DispatchProps> {

  public handleDragOver = (evt) => {
    if (evt.preventDefault) {
      evt.preventDefault();
    }

    return false;
  };

  public handleDrop = ()  => {
    console.log("field dropped, layout orientation", this.props.layoutOrientation);
  };

  public render() {
    if (!this.props.dragging) return null;
    return (
      <div className="facet-dropzone" onDragOver={(e) => this.handleDragOver(e)} onDrop={() => this.handleDrop()}>
        <div><i>Facet {this.props.layoutOrientation}</i></div>
      </div>
    );
  }

}

export default connect(mapStateToProps, mapDispatchToProps)(FacetDropzone);
