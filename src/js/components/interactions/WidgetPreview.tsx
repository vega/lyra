import * as React from 'react';
import {View, parse, Spec} from 'vega';
import {WidgetRecord, WidgetSelectionRecord} from '../../store/factory/Widget';
import {widgetParams, cleanSpecForPreview, addWidgetApplicationToScene, addWidgetSelectionToScene} from '../../ctrl/demonstrations';
import {MarkApplicationRecord} from '../../store/factory/Interaction';

const ctrl = require('../../ctrl');
const listeners = require('../../ctrl/listeners');

interface OwnProps {
  id: string,
  widget: WidgetRecord,
  groupName: string, // name of group mark (view) this preview is attached to,
  preview: WidgetSelectionRecord | MarkApplicationRecord;
}

export class WidgetPreview extends React.Component<OwnProps> {

  private width = 75; // these should match baseSignals in demonstrations.ts
  private height = 75; //

  private previewToSpec(preview: MarkApplicationRecord): Spec {
    const groupName = this.props.groupName;
    let spec = cleanSpecForPreview(ctrl.export(false), groupName);

    if (this.props.widget.selection) {
      spec = addWidgetSelectionToScene(spec, this.props.groupName, this.props.widget, this.props.widget.selection);
    }
    return addWidgetApplicationToScene(spec, this.props.groupName, this.props.widget, preview);
  }

  private view;

  public componentDidMount() {
    if ((this.props.preview as MarkApplicationRecord).targetMarkName) {
      const spec = this.previewToSpec(this.props.preview as MarkApplicationRecord);

      this.view = new View(parse(spec), {
        renderer:  'svg',  // renderer (canvas or svg)
        container: `#${this.props.groupName}-${this.props.id}`   // parent DOM container
      });
      this.view.width(this.width);
      this.view.height(this.height);
      this.view.runAsync();
    }
  }

  public componentDidUpdate(prevProps: OwnProps) {
    if ((this.props.preview as MarkApplicationRecord).targetMarkName) {
      if (prevProps.groupName !== this.props.groupName || prevProps.widget !== this.props.widget || prevProps.widget.selection !== this.props.widget.selection) {
        const spec = this.previewToSpec(this.props.preview as MarkApplicationRecord);

        this.view = new View(parse(spec), {
          renderer:  'svg',  // renderer (canvas or svg)
          container: `#${this.props.groupName}-${this.props.id}`   // parent DOM container
        });
        this.view.width(this.width);
        this.view.height(this.height);
        this.view.runAsync();
      }
    }
  };

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

  public setPreviewSignal(name, value) {
    if (this.view) {
      this.view.signal(name, value);
      this.view.runAsync();
    }
  }
  public render() {
    const isApplicationPreview = (this.props.preview as MarkApplicationRecord).targetMarkName;

    return (
      <div id={`${this.props.groupName}-${this.props.id}`} className={"interaction-preview"}>
        {
          isApplicationPreview ? null : this.widgetPreview()
        }
      </div>
    );
  }

}

export default WidgetPreview;
