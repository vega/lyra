import * as React from 'react';
import {WidgetRecord, WidgetSelectionRecord} from '../../store/factory/Widget';
import {widgetParams} from '../../ctrl/demonstrations';

interface OwnProps {
  id: string,
  widget: WidgetRecord,
  preview: WidgetSelectionRecord;
}

export class WidgetPreview extends React.Component<OwnProps> {

  private widgetPreview() {
    const params = widgetParams(this.props.widget.field, this.props.widget.dsId);

    switch (this.props.preview.type) {
      case 'radio':
        return params.options ? params.options.map((value, idx) => {
          return (
            <div key={value}>
              <input type="radio" name={this.props.preview.id} value={value} checked={idx === 0 ? true : null} />
              <label htmlFor={this.props.preview.id}>{value}</label>
            </div>
          )
        }) : null;
      case 'range':
        return (
          <div>
            <input type="range" {...params}></input>
            <label htmlFor={this.props.preview.id}>{this.props.widget.field.name}</label>
          </div>
        )
      case 'select':
        return (
          <select value={params.options && params.options.length ? params.options[0] : null}>
            {
              params.options ? params.options.map((value) => {
                return <option value={value}>{value}</option>
              }) : null
            }
          </select>
        )
    }
  }
  public render() {

    return (
      <div className={"interaction-preview"}>
        {this.widgetPreview()}
      </div>
    );
  }

}

export default WidgetPreview;
