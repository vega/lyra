import * as React from 'react';
import { connect } from 'react-redux';
import {State} from '../../store';
import {WidgetRecord} from '../../store/factory/Widget';
interface StateProps {
  widgets: WidgetRecord[];
}

function mapStateToProps(state: State): StateProps {
  const widgets = state.getIn(['vis', 'present', 'widgets']);

  return {
    widgets
  };
}

class BaseWidgetContainers extends React.Component<StateProps> {

  public render() {
    if (!this.props.widgets) return null;

    return (
      <div className="widgets-container">
        {
          this.props.widgets.filter(widget => widget.field).map(widget => {
            return <div key={widget.id} className={`widget_${widget.id}`}></div>
          })
        }
      </div>
    );
  }

}

export const WidgetContainers = connect(mapStateToProps, null)(BaseWidgetContainers);