import * as React from 'react';
import {View, parse, Spec} from 'vega';
import {ApplicationRecord, SelectionRecord, TransformApplicationRecord, InteractionInput, InteractionRecord, MarkApplication, MarkApplicationRecord} from '../../store/factory/Interaction';
import {addSelectionToScene, addApplicationToScene, cleanSpecForPreview} from '../../ctrl/demonstrations';
import exportName from '../../util/exportName';

const listeners = require('../../ctrl/listeners');
const ctrl = require('../../ctrl');

interface OwnProps {
  id: string,
  interaction: InteractionRecord,
  groupName: string, // name of group mark (view) this preview is attached to,
  applicationPreviews: ApplicationRecord[];
  preview: SelectionRecord | ApplicationRecord
}
interface OwnState {
}

export class InteractionPreview extends React.Component<OwnProps, OwnState> {

  constructor(props) {
    super(props);
  }

  private width = 75; // these should match baseSignals in demonstrations.ts
  private height = 75; //

  private previewToSpec(preview: SelectionRecord | ApplicationRecord): Spec {
    const groupName = (preview as TransformApplicationRecord).targetGroupName || this.props.groupName;
    let spec = cleanSpecForPreview(ctrl.export(false), groupName);

    switch (preview.type) {
      case 'point':
        let defaultApplication;
        if (this.props.interaction.applications.length) {
          defaultApplication = this.props.interaction.applications.find(application => {
            return application.type === 'mark';
          });
        }
        if (!defaultApplication && this.props.applicationPreviews.length) {
          defaultApplication = this.props.applicationPreviews.find(application => {
            return application.type === 'mark';
          });
        }
        if (defaultApplication) {
          spec = addApplicationToScene(spec, this.props.groupName, this.props.interaction.id, this.props.interaction.input, defaultApplication);
        }
      case 'interval':
        return addSelectionToScene(spec, this.props.groupName, this.props.interaction.id, this.props.interaction.input, preview as SelectionRecord);
      case 'mark':
      case 'scale':
      case 'transform':
        if (this.props.interaction.selection) {
          spec = addSelectionToScene(spec, this.props.groupName, this.props.interaction.id, this.props.interaction.input, this.props.interaction.selection);
        }
        return addApplicationToScene(spec, this.props.groupName, this.props.interaction.id, this.props.interaction.input, preview as ApplicationRecord);
    }
  }

  private view;

  public componentDidMount() {
    const spec = this.previewToSpec(this.props.preview);

    this.view = new View(parse(spec), {
      renderer:  'svg',  // renderer (canvas or svg)
      container: `#${this.props.groupName}-${this.props.id}`   // parent DOM container
    });
    this.view.width(this.width);
    this.view.height(this.height);
    this.view.runAsync();
  }

  public componentDidUpdate(prevProps: OwnProps) {
    if (prevProps.groupName !== this.props.groupName || prevProps.interaction !== this.props.interaction) {
      const spec = this.previewToSpec(this.props.preview);

      this.view = new View(parse(spec), {
        renderer:  'svg',  // renderer (canvas or svg)
        container: `#${this.props.groupName}-${this.props.id}`   // parent DOM container
      });
      this.view.width(this.width);
      this.view.height(this.height);
      this.view.runAsync();
    }
  };

  private scaleSignalValues(name, value) {
    const wScale = this.width/640; // preview width / main view width
    const hScale = this.height/360; // preview height / main view height

    if (name.startsWith('brush_x')) {
      return value.map(n => {
        return n * wScale;
      });
    }
    if (name.startsWith('brush_y')) {
      return value.map(n => {
        return n * hScale;
      });
    }
    if (name.startsWith('grid_translate_delta')) {
      return value ? {
        x: value.x * wScale,
        y: value.y * hScale
      } : value;
    }

    return value;
  }

  public setPreviewSignal(name, value) {
    if (this.view) {
      const scaledValue = this.scaleSignalValues(name, value);
      listeners.setSignalInGroup(this.view, this.props.groupName, name, scaledValue);
      this.view.runAsync();
    }
  }

  public getPreviewSignal(name) {
    if (this.view) {
      return listeners.getSignalInGroup(this.view, this.props.groupName, name);
    }
  }

  public render() {

    return (
      <div id={`${this.props.groupName}-${this.props.id}`} className={"interaction-preview"}></div>
    );
  }

}

export default InteractionPreview;
