'use strict';
const getIn = require('../../util/immutable-utils').getIn;
const lookup = require('../../ctrl').lookup;
const updateMarkProperty = require('../../actions/markActions').updateMarkProperty;

import * as React from 'react';
import {connect} from 'react-redux';
import { Dispatch } from 'redux';
import {State} from '../../store';
interface SymbolHintsProps {
    selectedId: number,
    updateProperty: (id: number, property: any, value: any) => void // TODO: fix 'any' type
}

function mapStateToProps(reduxState: State, ownProps: SymbolHintsProps) {
  return {
    selectedId: getIn(reduxState, 'inspector.encodings.selectedId')
  };
}
function mapDispatchToProps(dispatch: Dispatch, ownProps: SymbolHintsProps) {
  return {
    updateProperty: (id, property, value) => {
      // Update in the primitives dictionary
      const mark = lookup(id);
      if (mark) {
        mark[property] = value;
      }
      // Update in the global store
      dispatch(updateMarkProperty(id, property, value));
    }
  };
}

// Splitting each sidebar into its column
class BaseSymbolHints extends React.Component<SymbolHintsProps> {
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
