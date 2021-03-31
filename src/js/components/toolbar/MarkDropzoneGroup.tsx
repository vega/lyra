import * as React from 'react';
import { connect } from 'react-redux';
import {State} from '../../store';
import MarkDropzoneLine from './MarkDropzoneLine';

const layoutDirs = ['top', 'bottom', 'left', 'right'];
interface StateProps {
  layouts: number[];
}

function mapStateToProps(state: State): StateProps {
  const layoutList = state.getIn(['vis', 'present', 'layouts']);
  return {
    layouts: Array.from(layoutList.keys())
  };
}

class MarkDropzoneGroup extends React.Component<StateProps> {
  public render() {

    return (
      <div className='markdropzone-container'>
        {layoutDirs.map(function(dir, i) {
          return (
            <MarkDropzoneLine key={i} direction={dir} layoutId={this.props.layouts[0]}/>
          );
        }, this)}
      </div>
    )}

}

export default connect(mapStateToProps, null)(MarkDropzoneGroup);