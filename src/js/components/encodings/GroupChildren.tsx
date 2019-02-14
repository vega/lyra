import * as React from 'react';
import { connect } from 'react-redux';
import * as ReactTooltip from 'react-tooltip';
import { AnyAction } from 'redux';
import {ThunkDispatch} from 'redux-thunk';
import {deleteMark, updateMarkProperty} from '../../actions/markActions';
import {State} from '../../store'
import {GroupRecord} from '../../store/factory/marks/Group';
import { Icon } from '../Icon';
import GuideList from './GuideList';
import MarkList from './MarkList';

const ContentEditable = require('../ContentEditable');
const inspectorActions = require('../../actions/inspectorActions');
const selectMark = inspectorActions.selectMark;
const toggleLayers = inspectorActions.toggleLayers;
const imutils = require('../../util/immutable-utils');
const get = imutils.get;
const getIn = imutils.getIn;
const getInVis = imutils.getInVis;
const assets = require('../../util/assets');

interface OwnProps {
  id?: number;
  selectedId: number;
  sceneId: number;
}

interface StateProps {
  expandedLayers?: object;
  group: GroupRecord;
}

interface DispatchProps {
  selectGroup: () => void;
  deleteGroup: (evt) => void;
  updateName: (value: string) => void;
  toggleGroup?: () => void;
}

function mapStateToProps(reduxState: State, ownProps: OwnProps): StateProps {
  return {
    expandedLayers: reduxState.getIn(['inspector','encodings', 'expandedLayers']),
    group: getInVis(reduxState, 'marks.' + ownProps.id)
  };
}

function mapDispatchToProps(dispatch: ThunkDispatch<State, null, AnyAction>, ownProps: OwnProps): DispatchProps {
  return {
    selectGroup: function() {
      dispatch(selectMark(ownProps.id));
    },

    deleteGroup: function(evt) {
      const id = ownProps.id;
      if (ownProps.selectedId === id) {
        dispatch(selectMark(ownProps.sceneId));
      }
      dispatch(deleteMark(id));
      evt.preventDefault();
      evt.stopPropagation();
      ReactTooltip.hide();
    },

    updateName: function(value) {
      dispatch(updateMarkProperty({property: 'name', value}, ownProps.id));
    },

    toggleGroup: function() {
      dispatch(toggleLayers([ownProps.id]));
    }
  };
}

class Group extends React.Component<OwnProps & StateProps & DispatchProps> {

  public componentDidUpdate() {
    ReactTooltip.rebuild();
  }

  public render() {
    const props = this.props;
    const id = props.id;
    const group = props.group;
    const name  = group.name;
    const isExpanded = get(props.expandedLayers, id);
    const groupClass = isExpanded ? 'expanded' : 'contracted';

    return (
      <li className={groupClass}>
        <div className={'name' + (props.selectedId === id ? ' selected' : '')}
          onClick={props.selectGroup}>

          <Icon glyph={assets['group-' + groupClass]} onClick={props.toggleGroup} />

          <ContentEditable value={name} save={props.updateName}
            onClick={props.selectGroup} />

          <Icon glyph={assets.trash} className='delete'
            onClick={props.deleteGroup} data-html={true} data-place='right'
            data-tip={'Delete ' + name + ' and <br> everything inside it'} />
        </div>

        {isExpanded && group.get('marks') ? (
          <ul className='group'>
            <GuideList groupId={id} {...props} />
            <MarkList groupId={id} {...props} />
          </ul>
        ) : null}
      </li>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Group);
