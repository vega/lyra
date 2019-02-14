import * as React from 'react';
import { connect } from 'react-redux';
import {addMark} from '../../actions/markActions';
import { LyraMarkType, Mark } from '../../store/factory/Mark';
import { Icon } from '../Icon';

const getClosestGroupId = require('../../util/hierarchy').getClosestGroupId;
const assets = require('../../util/assets');

function mapDispatchToProps(dispatch, ownProps) {
  return {
    addMark: (type) => {
      const newMarkProps = Mark(type, {
        _parent: getClosestGroupId()
      });
      dispatch(addMark(newMarkProps));
    }
  };
}

// Currently supported mark types
// TODO don't repeat this list across the codebase
const marksArray = ['rect', 'symbol', 'text', 'line', 'area'];

interface AddMarksToolProps {
  addMark: (type: LyraMarkType) => void;
}

class AddMarksTool extends React.Component<AddMarksToolProps> {

  public classNames: 'new-marks';
  public render() {
    return (
      <ul>
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
