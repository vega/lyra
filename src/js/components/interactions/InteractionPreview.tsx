import * as React from 'react';
import {View, parse, Spec} from 'vega';

const listeners = require('../../ctrl/listeners');

interface OwnProps {
  id: string,
  groupName: string, // name of group mark (view) this preview is attached to,
  spec: Spec,
  onClick: () => void
}
interface OwnState {
}

export class InteractionPreview extends React.Component<OwnProps, OwnState> {

  constructor(props) {
    super(props);
  }

  private view;

  public componentDidMount() {
    this.view = new View(parse(this.props.spec), {
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

  public render() {

    return (
      <div id={`${this.props.groupName}-${this.props.id}`} onClick={this.props.onClick}></div>
    );
  }

}

export default InteractionPreview;
