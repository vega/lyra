import * as React from 'react';
import { connect } from 'react-redux';
import InteractionPreviewController from './InteractionPreviewController';
import InteractionWidget from './InteractionWidget'

class InteractionPreviewContainer extends React.Component {

  constructor(props) {
    super(props);
  }
  public render() {

    return (
      <React.Fragment>
        <InteractionWidget></InteractionWidget>
        <InteractionPreviewController></InteractionPreviewController>
      </React.Fragment>
    )

  }

}

export default connect()(InteractionPreviewContainer);
