import * as React from 'react';
import { connect } from 'react-redux';
import {State} from '../../store';
import {PlaceHolderRecord} from '../../store/factory/Layout';
import MarkDropPlace from './MarkDropPlace';

interface StateProps {
  layoutId: number;
  placeholders: PlaceHolderRecord[];
}

function mapStateToProps(state: State): StateProps {
  const layouts = state.getIn(['vis', 'present', 'layouts']);

  const layoutId = Array.from(layouts.keys())[0];
  // const layout = layouts.filter(layout => layout._id == ind);
  const placeholders = state.getIn(['vis', 'present', 'layouts', layoutId, 'placeHolders']);

  return {
    layoutId: +layoutId,
    placeholders
  };
}

class MarkDropzoneGroup extends React.Component<StateProps> {
  public render() {
    // console.log("mark group layout id", this.props.layout.toJS());
    return (
      <div className='markdropzone-container'>
        {/* {this.props.layouts.map((layout) => { */}
          {this.props.placeholders.map((placeholder, j)=> {
            return (
              <MarkDropPlace key={j} layoutId={this.props.layoutId} placeholderId={placeholder._id} top={placeholder.top} left={placeholder.left} width={placeholder.width} height={placeholder.height}/>
            );
          })}

        {/* }, this)} */}
      </div>
    )}

}

export default connect(mapStateToProps, null)(MarkDropzoneGroup);