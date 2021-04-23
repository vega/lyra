import * as React from 'react';
import { connect } from 'react-redux';
import {State} from '../../store';
import {FieldDraggingStateRecord} from '../../store/factory/Inspector';
// import {GroupFacet} from "../../store/factory/marks/Group";
import {Facet} from 'vega-typings';
import {getClosestGroupId} from '../../util/hierarchy';
import {addFacetLayout} from '../../actions/facetLayoutActions';
import {addFacet} from '../../actions/markActions';
import {FacetLayout} from '../../store/factory/FacetLayout';
interface StateProps {
  dragging: FieldDraggingStateRecord;
  groupId: number;
}

interface OwnProps {
  layoutOrientation: string
}
interface DispatchProps {
  facetField: (field: string, groupId: number) => void;
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
    facetField: (field, groupId) => {
      let numCols;
      if (ownProps.layoutOrientation == "vertical") {
        numCols = 1;
      } else {
        numCols = null;
      }
      dispatch(addFacetLayout(FacetLayout({columns: numCols})));
      // dispatch(addGroupFacet(GroupFacet({facet: {name: "facet", data: "cars_source_5", groupby: [field]}}), groupId)); // remove hardcoded data name
      dispatch(addFacet({name: "facet",data: "5", groupby: field} as Facet, groupId));
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
    this.props.facetField(this.props.dragging.fieldDef.name, this.props.groupId);
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
