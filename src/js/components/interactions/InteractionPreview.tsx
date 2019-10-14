import * as React from 'react';
import { connect } from 'react-redux';
import {State} from '../../store';
import {View, parse, Spec} from 'vega';
import {getScaleNameFromAxisRecords, getFieldFromScaleRecordName, cleanSpecForPreview, editSignalsForPreview} from '../../ctrl/demonstrations';
import {GuideRecord} from '../../store/factory/Guide';
import {Map} from 'immutable';
import {ScaleRecord} from '../../store/factory/Scale';

const ctrl = require('../../ctrl');
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
    }
  }

  public render() {

    return (
      <div id={`${this.props.groupName}-${this.props.id}`} onClick={this.props.onClick}></div>
    );
  }

}

export default InteractionPreview;
