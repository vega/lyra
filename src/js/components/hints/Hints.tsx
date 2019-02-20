'use strict';
const assets = require('../../util/assets');

import * as React from 'react';
import {connect} from 'react-redux';
import {Dispatch} from 'redux';
import * as hintActions from '../../actions/hintActions';
import {State} from '../../store';
import {HintsDisplay, HintsTemplateDisplay} from '../../store/factory/Hints';
import { Icon } from '../Icon';

interface StateProps {
  displayHint: HintsDisplay
}

interface DispatchProps {
  dispatchAction: () => void,
  clearHints: () => void
}

function mapStateToProps(reduxState: State, ownProps): StateProps {
  return {
    displayHint: reduxState.getIn(['hints', 'display'])
  };
}

function mapDispatchToProps(dispatch: Dispatch, ownProps): DispatchProps {
  return {
    dispatchAction: function() {
      const action = this.props.displayHint.action;
      const actionProps = this.props.displayHint.action_props !== undefined ?
        this.props.displayHint.action_props : '';
      dispatch(action(actionProps));
      dispatch(hintActions.clearHints());
    },
    clearHints: function() {
      dispatch(hintActions.clearHints());
    }
  };
}

function isHintsTemplateDisplay(hint: HintsDisplay): hint is HintsTemplateDisplay {
  return (hint as HintsTemplateDisplay).template !== undefined;
}

class BaseHints extends React.Component<StateProps & DispatchProps> {
  public classNames: 'hints';
  public render() {
    const hint = this.props.displayHint;
    // If there is an action in the displayHint object, show the action button.
    const action = hint.action ? (
        <a className='action button button-secondary' onClick={this.props.dispatchAction.bind(this, '')}>
          {hint.action_text}
        </a>
      ) : '';
    // Content is dependent on if the hint template exists
    if (isHintsTemplateDisplay(hint)) {
      const Template = hint.template;
      return <Template/>;
    }
    else {
      const content = (
        <div>
          <h4 className='hint-header'>{hint.title}</h4>
          <p>
            {hint.text}
          </p>
        </div>
      );
      return (
        <div className={this.classNames}>
          {content}
          {action}
          <span className='close-hint' onClick={this.props.clearHints.bind(null, '')}>
            <Icon glyph={assets.close} />
          </span>
        </div>
      );
    }
  };
};

export const Hints = connect(
  mapStateToProps,
  mapDispatchToProps
)(BaseHints);
