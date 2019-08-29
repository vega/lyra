import * as React from 'react';
import { connect } from 'react-redux';
import {State} from '../../store';
import {View, parse} from 'vega';

const ctrl = require('../../ctrl');

interface OwnProps {
  id: string
}
interface StateProps {
  vegaIsParsing: boolean
}

interface OwnState {
}

function mapStateToProps(state: State, ownProps: OwnProps): StateProps {
  const isParsing = state.getIn(['vega', 'isParsing']);
  return {
    vegaIsParsing: isParsing
  };
}

class InteractionPreview extends React.Component<OwnProps & StateProps, OwnState> {

  constructor(props) {
    super(props);

    this.state = {

    };
  }

  private view: View;

  private attachView() {
    this.view = new View(parse(ctrl.export()), {
      renderer:  'canvas',  // renderer (canvas or svg)
      container: '#'+this.props.id,   // parent DOM container
      hover:     true       // enable hover processing
    });
    this.view.width(100);
    this.view.height(100);
    this.view.runAsync();
  }

  public componentDidMount() {
    this.attachView();
  };

  public componentDidUpdate(prevProps) {
    if (prevProps.vegaIsParsing && !this.props.vegaIsParsing) {
      this.attachView();
    }
  }
  public render() {

    return (
      <div id={this.props.id}></div>
    );
  }

}

export default connect(mapStateToProps)(InteractionPreview);
