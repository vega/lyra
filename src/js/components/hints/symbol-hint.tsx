import * as React from 'react';
import {connect} from 'react-redux';
import { Dispatch } from 'redux';
import {updateMarkProperty} from '../../actions/markActions';
import {State} from '../../store';

const lookup = require('../../ctrl').lookup; // TODO(jzong) ??? what is this? doesn't exist?

interface StateProps {
    selectedId: number
}

interface DispatchProps {
  updateProperty: (id: number, property: string, value: any) => void
}

function mapStateToProps(reduxState: State, ownProps): StateProps {
  return {
    selectedId: reduxState.getIn(['inspector', 'encodings', 'selectedId'])
  };
}
function mapDispatchToProps(dispatch: Dispatch, ownProps): DispatchProps {
  return {
    updateProperty: (id, property, value) => {
      // Update in the primitives dictionary
      const mark = lookup(id);
      if (mark) {
        mark[property] = value; // TODO(jzong) what is happening here??
      }
      // Update in the global store
      dispatch(updateMarkProperty({property, value}, id));
    }
  };
}

// Splitting each sidebar into its column
class BaseSymbolHints extends React.Component<StateProps & DispatchProps> {
  public render() {
    return (
      <div>
        <p>I have a special template!!!</p>
      </div>
    );
  }
};

export const SymbolHints = connect(
  mapStateToProps,
  mapDispatchToProps
)(BaseSymbolHints);
