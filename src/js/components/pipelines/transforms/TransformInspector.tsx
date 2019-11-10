import * as React from 'react';
import {connect} from 'react-redux';
import {Dispatch} from 'redux';
import {Transforms} from 'vega-typings/types';
import {updateTransform} from '../../../actions/datasetActions';
import {Filter as filter} from './Filter';
import {Formula as formula} from './Formula';

const capitalize = require('capitalize');

interface OwnProps {
  dsId: number;
  index: number;
  def: Transforms;
}
interface DispatchProps {
  updateTransform: (def: Transforms) => void;
}

interface OwnState {
  expanded: boolean;
}

function mapDispatch(dispatch: Dispatch, ownProps: OwnProps): DispatchProps {
  return {
    updateTransform: function(def) {
      dispatch(updateTransform({index: ownProps.index, transform: def}, ownProps.dsId));
    }
  };
}

export class TransformInspector extends React.Component<OwnProps & DispatchProps, OwnState> {

  public Filter = filter;
  public Formula = formula;
  private timer = null;

  constructor(props) {
    super(props);

    this.state = {
      expanded: true
    }
  }

  public componentDidMount() {
    this.resetTimer();
  }

  public componentWillUnmount() {
    window.clearTimeout(this.timer);
  }

  public resetTimer = () => {
    window.clearTimeout(this.timer);
    this.timer = window.setTimeout(() => {
      this.setState({expanded: false});
    }, 10000);
  }

  public expand = () => {
    this.setState({expanded: true});
    this.resetTimer();
  }

  public updateTransform = (def) => {
    this.props.updateTransform(def);
    this.resetTimer();
  }

  public render() {
    const props = this.props;
    const type = capitalize(props.def.type);
    const InspectorType = this[type];

    return !this.state.expanded ?
      (<div className='transform-button' onClick={this.expand}>{type}</div>) :
      (<div className='transform-inspector'>
        <InspectorType update={this.updateTransform} {...props} />
      </div>);
  }
}

export default connect(null, mapDispatch)(TransformInspector);
