import * as React from 'react';
import {View, parse, Spec} from 'vega';
import {ApplicationRecord, SelectionRecord} from '../../store/factory/Interaction';
import {addSelectionToScene, addApplicationToScene, cleanSpecForPreview} from '../../ctrl/demonstrations';

const listeners = require('../../ctrl/listeners');
const ctrl = require('../../ctrl');

interface OwnProps {
  id: string,
  groupName: string, // name of group mark (view) this preview is attached to,
  preview: SelectionRecord | ApplicationRecord,
  onClick: () => void
}
interface OwnState {
}

export class InteractionPreview extends React.Component<OwnProps, OwnState> {

  constructor(props) {
    super(props);
  }

  private previewToSpec(preview: SelectionRecord | ApplicationRecord): Spec {
    // const spec = ctrl.export(false, true);
    const spec = cleanSpecForPreview(ctrl.export(false, true), this.props.groupName);

    switch (preview.type) {
      case 'point':
      case 'interval':
        return addSelectionToScene(spec, this.props.groupName, preview as SelectionRecord);
      case 'mark':
      case 'scale':
      case 'transform':
        return addApplicationToScene(spec, this.props.groupName, preview as ApplicationRecord);
    }
    // console.warn('expected switch to be exhaustive');
    return spec;
  }

  private view;

  public componentDidMount() {
    const spec = this.previewToSpec(this.props.preview);

    // console.log(this.props.id, spec);

    this.view = new View(parse(spec), {
      renderer:  'svg',  // renderer (canvas or svg)
      container: `#${this.props.groupName}-${this.props.id}`   // parent DOM container
    });
    this.view.width(100);
    this.view.height(100);
    this.view.runAsync();
  };

  public width() {
    return this.view.width();
  }

  public height() {
    return this.view.height();
  }

  public setPreviewSignal(name, value) {
    if (this.view) {
      listeners.setSignalInGroup(this.view, this.props.groupName, name, value);
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
      <div id={`${this.props.groupName}-${this.props.id}`} className={"interaction-preview"} onClick={this.props.onClick}></div>
    );
  }

}

export default InteractionPreview;
