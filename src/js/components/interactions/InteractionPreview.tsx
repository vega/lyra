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
  group: string, // name of group mark (view) this preview is attached to,
  spec: Spec
}
interface OwnState {
}

export class InteractionPreview extends React.Component<OwnProps, OwnState> {

  constructor(props) {
    super(props);

    this.state = {

    };
  }

  private view;

  public componentDidMount() {
    console.log(this.props.spec);
    this.view = new View(parse(this.props.spec), {
      renderer:  'svg',  // renderer (canvas or svg)
      container: `#${this.props.group}-${this.props.id}`   // parent DOM container
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
      listeners.setSignalInGroup(this.view, this.props.group, name, value);
    }
  }

  public render() {

    return (
      <div id={`${this.props.group}-${this.props.id}`}></div>
    );
  }

}

export default InteractionPreview;
