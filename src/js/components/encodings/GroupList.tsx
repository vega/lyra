import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import {State} from '../../store';
import Group from './GroupChildren';

const imutils = require('../../util/immutable-utils');
const getIn = imutils.getIn;
const getInVis = imutils.getInVis;
const Mark = require('../../store/factory/Mark');
const addMark = require('../../actions/markActions').addMark;
const selectMark = require('../../actions/inspectorActions').selectMark;
const clearScene = require('../../actions/sceneActions').clearScene;
const assets = require('../../util/assets');
const Icon = require('../Icon');

interface StateProps {
  sceneId: number;
  selectedId: number;
  marks: any;
}

interface DispatchProps {
  addMark: (type, parentId) => void;
  selectMark: (id) => void;
  clearScene: (event) => void;
}

function mapStateToProps(reduxState: State): StateProps {
  const sceneId = getInVis(reduxState, 'scene.id');
  return {
    sceneId: sceneId,
    selectedId: getIn(reduxState, 'inspector.encodings.selectedId'),
    marks: getInVis(reduxState, 'marks.' + sceneId + '.marks')
  };
}

function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
  return {
    addMark: function(type, parentId) {
      dispatch(addMark(Mark(type, {_parent: parentId})));
    },
    selectMark: function(id) {
      dispatch(selectMark(id));
    },
    clearScene: function(event) {
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
            <Icon glyph={assets.plus} /> New
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
