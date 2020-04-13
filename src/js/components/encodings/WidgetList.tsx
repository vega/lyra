import * as React from 'react';
import { connect } from 'react-redux';
import ReactTooltip from 'react-tooltip'
import { AnyAction } from 'redux';
import {ThunkDispatch} from 'redux-thunk';
import {selectWidget, InspectorSelectedType, selectMark} from '../../actions/inspectorActions';
import {State} from '../../store';
import { Icon } from '../Icon';
import {ScaleInfo} from '../../store/factory/Interaction';
import {WidgetRecord, Widget} from '../../store/factory/Widget';
import {addWidget, deleteWidget, updateWidgetName} from '../../actions/widgetActions';
import {addInteractionToGroup} from '../../actions/bindChannel/helperActions';
import {getScaleInfoForGroup} from '../../ctrl/demonstrations';

const ContentEditable = require('../ContentEditable');
const assets = require('../../util/assets');
const ctrl = require('../../ctrl');

interface OwnProps {
  groupId: number;
  selectedId?: number;
  selectedType?: InspectorSelectedType;
}
interface StateProps {
  widgets: WidgetRecord[];
  canDemonstrate: boolean;
}

interface DispatchProps {
  selectWidget: (widgetId: number) => void;
  deleteWidget: (selectedId: number, groupId: number, widgetId: number, evt: any) => void;
  updateName: (widgetId: number, value: string) => void;
}

function mapStateToProps(state: State, ownProps: OwnProps): StateProps {
  const scaleInfo: ScaleInfo = getScaleInfoForGroup(state, ownProps.groupId);
  const isParsing = state.getIn(['vega', 'isParsing']);
  const canDemonstrate = Boolean(!isParsing && ctrl.view && (scaleInfo.xScaleName && scaleInfo.xFieldName || scaleInfo.yScaleName && scaleInfo.yFieldName));

  const widgets = state.getIn(['vis', 'present', 'marks', String(ownProps.groupId), '_widgets']);
  return {
    widgets: widgets ? widgets.map(function(interactionId) {
      return state.getIn(['vis', 'present', 'widgets', String(interactionId)]);
    }) : [],
    canDemonstrate
  };
}

function mapDispatchToProps(dispatch: ThunkDispatch<State, null, AnyAction>): DispatchProps {
  return {
    selectWidget: function(widgetId) {
      dispatch(selectWidget(widgetId));
    },

    deleteWidget: function (selectedId, groupId, widgetId, evt) {
      if (selectedId === widgetId) {
        dispatch(selectMark(groupId));
      }
      dispatch(deleteWidget({groupId}, widgetId));
      evt.preventDefault();
      evt.stopPropagation();
      ReactTooltip.hide();
    },

    updateName: function(widgetId, value) {
      dispatch(updateWidgetName(value, widgetId));
    },
  };
}


class WidgetList extends React.Component<OwnProps & StateProps & DispatchProps> {

  public componentDidUpdate() {
    ReactTooltip.rebuild();
  }

  public render() {
    const props = this.props;
    const selectedId = props.selectedId;
    const selectedType = props.selectedType;

    return (
      <div className='interaction-list'>
        <li className='header'>
          Widgets
        </li>

        {props.widgets.map(function(widget) {
          const widgetId = widget.id;
          const name = widget.name;

          return (
            <li key={widgetId}>
              <div className={'name' + (selectedId === widgetId && selectedType === InspectorSelectedType.SELECT_WIDGET ? ' selected' : '')}
                onClick={props.selectWidget.bind(null, widgetId)}>

                <Icon glyph={assets.select} />

                <ContentEditable value={name}
                  save={props.updateName.bind(null, widgetId)}
                  onClick={props.selectWidget.bind(null, widgetId)} />

                <Icon glyph={assets.trash} className='delete'
                  onClick={props.deleteWidget.bind(null, selectedId, this.props.groupId, widgetId)}
                  data-tip={'Delete ' + name} data-place='right' />
              </div>
            </li>
          );
        }, this)}
      </div>
    );
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(WidgetList);
