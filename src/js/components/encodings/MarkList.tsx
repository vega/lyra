import * as React from 'react';
import { connect } from 'react-redux';
import ReactTooltip from 'react-tooltip'
import { AnyAction } from 'redux';
import {ThunkDispatch} from 'redux-thunk';
import {selectMark, InspectorSelectedType} from '../../actions/inspectorActions';
import {deleteMark, updateMarkProperty} from '../../actions/markActions';
import {State} from '../../store';
import {MarkRecord} from '../../store/factory/Mark';
import { Icon } from '../Icon';

const getInVis = require('../../util/immutable-utils').getInVis;
const ContentEditable = require('../ContentEditable');
const assets = require('../../util/assets');

interface OwnProps {
  groupId: number;
  selectedId?: number;
  selectedType?: InspectorSelectedType;
}
interface StateProps {
  marks: MarkRecord[];
}

interface DispatchProps {
  selectMark: (markId: number) => void;
  deleteMark: (selectedId: number, markId: number, evt: any) => void;
  updateName: (markId: number, value: any) => void;
}

function mapStateToProps(reduxState: State, ownProps: OwnProps): StateProps {
  const marks = getInVis(reduxState, 'marks.' + ownProps.groupId + '.marks');
  return {
    marks: marks.map(function(markId) {
      return getInVis(reduxState, 'marks.' + markId);
    })
  };
}

function mapDispatchToProps(dispatch: ThunkDispatch<State, null, AnyAction>, ownProps: OwnProps): DispatchProps {
  return {
    selectMark: function(markId) {
      dispatch(selectMark(markId));
    },

    deleteMark: function(selectedId, markId, evt) {
      if (selectedId === markId) {
        dispatch(selectMark(ownProps.groupId));
      }
      dispatch(deleteMark(markId));
      evt.preventDefault();
      evt.stopPropagation();
      ReactTooltip.hide();
    },

    updateName: function(markId, value) {
      dispatch(updateMarkProperty({property: 'name', value}, markId));
    },
  };
}


class MarkList extends React.Component<OwnProps & StateProps & DispatchProps> {

  public componentDidUpdate() {
    ReactTooltip.rebuild();
  }

  public render() {
    const props = this.props;
    const selectedId = props.selectedId;
    const selectedType = props.selectedType;

    return (
      <div>
        <li className='header'>
          Marks <Icon glyph={assets.plus} width='10' height='10' />
        </li>

        {props.marks.map(function(mark, i) {
          const markId = mark._id;
          const name = mark.name;

          return (
            <li key={markId}>
              <div className={'name' + (selectedId === markId && selectedType === InspectorSelectedType.SELECT_MARK ? ' selected' : '')}
                onClick={props.selectMark.bind(null, markId)}>

                <Icon glyph={assets[mark.type]} />

                <ContentEditable value={name}
                  save={props.updateName.bind(null, markId)}
                  onClick={props.selectMark.bind(null, markId)} />

                <Icon glyph={assets.trash} className='delete'
                  onClick={props.deleteMark.bind(null, selectedId, markId)}
                  data-tip={'Delete ' + name} data-place='right' />
              </div>
            </li>
          );
        }, this)}
      </div>
    );
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(MarkList);
