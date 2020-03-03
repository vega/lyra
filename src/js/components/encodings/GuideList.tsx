import {List, Map} from 'immutable';
import * as React from 'react';
import { connect } from 'react-redux';
import ReactTooltip from 'react-tooltip'
import { AnyAction } from 'redux';
import {ThunkDispatch} from 'redux-thunk';
import {deleteGuide} from '../../actions/guideActions';
import {selectGuide, selectMark, InspectorSelectedType} from '../../actions/inspectorActions';
import {State} from '../../store';
import {AxisRecord, GuideRecord, GuideType, LegendForType, LegendRecord} from '../../store/factory/Guide';
import {ScaleRecord} from '../../store/factory/Scale';
import { Icon } from '../Icon';

const capitalize = require('capitalize');
const imutils = require('../../util/immutable-utils');
const getInVis = imutils.getInVis;
const assets = require('../../util/assets');
interface OwnProps {
  groupId: number;
  selectedId: number;
  selectedType: InspectorSelectedType;
}

interface StateProps {
  scales?: Map<string, ScaleRecord>;
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

function mapDispatchToProps(dispatch: ThunkDispatch<State, null, AnyAction>, ownProps: OwnProps): DispatchProps {
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
    const selectedType = props.selectedType;

    return (
      <div>
        <li className='header'>
          Guides {/* <Icon glyph={assets.plus} width='10' height='10' /> */}
        </li>

        {props.guides.map(function(guide) {
          const guideId = guide._id;
          let scaleId;
          if (guide._gtype === GuideType.Axis) {
            guide = guide as AxisRecord;
            scaleId = guide.scale;
          } else if (guide._gtype === GuideType.Legend) {
            guide = guide as LegendRecord;
            scaleId = guide[guide._type];
          }
          const name = capitalize(props.scales.getIn([scaleId, 'name']));
          const type = capitalize(guide._gtype);

          return (
            <li key={guideId}>
              <div style={{"paddingLeft": "26px"}} className={'name' + (selectedId === guideId && selectedType === InspectorSelectedType.SELECT_GUIDE ? ' selected' : '')}
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
