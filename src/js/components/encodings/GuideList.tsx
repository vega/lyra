import * as React from 'react';
import { connect } from 'react-redux';
import * as ReactTooltip from 'react-tooltip';
import { Dispatch } from 'redux';
import {State} from '../../store';
import { Icon } from '../Icon';
import {deleteGuide} from '../../actions/guideActions';
import {List} from 'immutable';
import {GuideRecord} from '../../store/factory/Guide';

const capitalize = require('capitalize');
const inspectorActions = require('../../actions/inspectorActions');
const selectMark = inspectorActions.selectMark;
const selectGuide = inspectorActions.selectGuide;
const imutils = require('../../util/immutable-utils');
const getIn = imutils.getIn;
const getInVis = imutils.getInVis;
const assets = require('../../util/assets');
interface OwnProps {
  groupId: number;
  selectedId: number;
}

interface StateProps {
  scales?: any; // Immutable.Map
  guides?: List<GuideRecord>;
}

interface DispatchProps {
  selectGuide: (guideId: number) => void;
  deleteGuide: (selectedId: number, guideId: number, evt: any) => void;
}

function mapStateToProps(reduxState: State, ownProps: OwnProps): StateProps {
  const groupId = ownProps.groupId;
  const axes = getInVis(reduxState, 'marks.' + groupId + '.axes');
  const legends = getInVis(reduxState, 'marks.' + groupId + '.legends');

  return {
    scales: getInVis(reduxState, 'scales'),
    guides: axes.concat(legends).map(function(guideId) {
      return getInVis(reduxState, 'guides.' + guideId);
    }).filter(function(guide) {
      return !!guide; // checking for existence
    })
  };
}

function mapDispatchToProps(dispatch: Dispatch, ownProps: OwnProps): DispatchProps {
  return {
    selectGuide: function(guideId) {
      dispatch(selectGuide(guideId));
    },
    deleteGuide: function(selectedId, guideId, evt) {
      const groupId = ownProps.groupId;
      if (selectedId === guideId) {
        dispatch(selectMark(groupId));
      }
      dispatch(deleteGuide({groupId}, guideId));
      evt.preventDefault();
      evt.stopPropagation();
      ReactTooltip.hide();
    },
  };
}

class GuideList extends React.Component<OwnProps & StateProps & DispatchProps> {
  public componentDidUpdate() {
    ReactTooltip.rebuild();
  }

  public render() {
    const props = this.props;
    const selectedId = props.selectedId;

    return (
      <div>
        <li className='header'>
          Guides <Icon glyph={assets.plus} width='10' height='10' />
        </li>

        {props.guides.map(function(guide) {
          const guideId = guide.get('_id');
          const scaleId = guide.get('scale'); // || guide.get(guide.get('type')); TODO(rneogy) figure out if we need this?
          const name = capitalize(getIn(props.scales, scaleId + '.name'));
          const type = capitalize(guide.get('_gtype'));

          return (
            <li key={guideId}>
              <div className={'name' + (selectedId === guideId ? ' selected' : '')}
                onClick={props.selectGuide.bind(null, guideId)}>

                {name + ' ' + type}

                <Icon glyph={assets.trash} className='delete'
                  onClick={props.deleteGuide.bind(null, selectedId, guideId)}
                  data-tip={'Delete ' + name + ' ' + type} data-place='right' />
              </div>
            </li>
          );
        })}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(GuideList);