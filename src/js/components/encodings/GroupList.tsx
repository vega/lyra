import * as React from 'react';
import { connect } from 'react-redux';
import { AnyAction } from 'redux';
import {ThunkDispatch} from 'redux-thunk';
import {selectMark} from '../../actions/inspectorActions';
import {addMark} from '../../actions/markActions';
import {clearScene} from '../../actions/sceneActions';
import {State} from '../../store';
import { LyraMarkType, Mark } from '../../store/factory/Mark';
import { Icon } from '../Icon';
import Group from './GroupChildren';

const imutils = require('../../util/immutable-utils');
const getInVis = imutils.getInVis;
const assets = require('../../util/assets');

interface StateProps {
  sceneId: number;
  selectedId: number;
  marks: number[]; // list of ids
}

interface DispatchProps {
  addMark: (type: LyraMarkType, parentId: number) => void;
  selectMark: (id: number) => void;
  clearScene: () => void;
}

function mapStateToProps(reduxState: State): StateProps {
  const sceneId = getInVis(reduxState, 'scene._id');
  return {
    sceneId: sceneId,
    selectedId: reduxState.getIn(['inspector', 'encodings', 'selectedId']),
    marks: getInVis(reduxState, 'marks.' + sceneId + '.marks')
  };
}

function mapDispatchToProps(dispatch: ThunkDispatch<State, null, AnyAction>): DispatchProps {
  return {
    addMark: function(type, parentId) {
      dispatch(addMark(Mark(type, {_parent: parentId})));
    },
    selectMark: function(id) {
      dispatch(selectMark(id));
    },
    clearScene: function() {
      dispatch(selectMark(null));
      dispatch(clearScene());
    }
  };
}

class GroupList extends React.Component<StateProps & DispatchProps> {

  public render() {
    const props = this.props;
    const sceneId = props.sceneId;
    const sceneSelected = props.selectedId === sceneId;
    const groups = props.marks ? props.marks : [];

    return (
      <div id='layer-list' className='expandingMenu'>
        <h2>Groups
          <span className='new'
            onClick={this.props.addMark.bind(null, 'group', sceneId)}>
            <Icon glyph={assets.plus} />
          </span>
        </h2>

        <ul>
          <li id='scene'>
            <div className={'edit name' + (sceneSelected ? ' selected' : '')}
              onClick={this.props.selectMark.bind(null, sceneId)}> Edit Scene

              <Icon glyph={assets.erase} className='delete'
                onClick={this.props.clearScene}
                data-html={true} data-tip={'Clear scene'} data-place='right' />
            </div>
          </li>
        </ul>

        <ul>
          {groups.map(function(id) {
            return (<Group key={id} id={id} {...props} />);
          }, this)}
        </ul>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(GroupList);
