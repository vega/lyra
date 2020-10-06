import * as React from 'react';
import { connect } from 'react-redux';
import {addMark} from '../../actions/markActions';
import { LyraMarkType, Mark } from '../../store/factory/Mark';
import { Icon } from '../Icon';
import {getClosestGroupId} from '../../util/hierarchy';

const assets = require('../../util/assets');

// Currently supported mark types
// TODO don't repeat this list across the codebase
const marksArray = ['rect', 'symbol', 'text', 'line', 'area'];

interface DispatchProps {
  addMark: (type: LyraMarkType) => void;
}

function mapDispatchToProps(dispatch, ownProps): DispatchProps {
  return {
    addMark: (type) => {
      const parentId = getClosestGroupId();
      console.log(parentId)
      if (parentId === 1) {
        // parent is scene. don't add marks directly to the scene (marks should be under a group)
        return;
      }
      const newMarkProps = Mark(type, {
        _parent: parentId
      });
      dispatch(addMark(newMarkProps));
    }
  };
}

class AddMarksTool extends React.Component<DispatchProps> {

  public classNames: 'new-marks';
  public render() {
    return (
      <ul className='add-marks'>
        {marksArray.map(function(markType, i) {
          return (
            <li
              key={markType}
              onClick={this.props.addMark.bind(null, markType)}
            >
              <Icon glyph={assets[markType]} /> {markType}
            </li>
          );
        }, this)}
      </ul>
    );
  }
}

export const AddMarks = connect(
  null,
  mapDispatchToProps
)(AddMarksTool);
