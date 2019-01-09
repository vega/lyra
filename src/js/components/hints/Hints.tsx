'use strict';
const getIn = require('../../util/immutable-utils').getIn;
const hintActions = require('../../actions/hintActions');
const assets = require('../../util/assets');
const Icon = require('../Icon');

import * as React from 'react';
import {connect} from 'react-redux';
import { Dispatch } from 'redux';
import {State} from '../../store';

interface HintsProps {
  displayHint: any,
  dispatchAction: () => any,
  clearHints: () => any
}

function mapStateToProps(reduxState: State, ownProps: HintsProps) {
  return {
    displayHint: getIn(reduxState, 'hints.display')
  };
}

function mapDispatchToProps(dispatch: Dispatch, ownProps: HintsProps) {
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

class BaseHints extends React.Component<HintsProps> {
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
    const Template = hint.template;
    const content = Template ? (<Template/>) :
      (
        <div>
          <h4 className='hint-header'>{hint.title}</h4>
          <p>
            {hint.text}
          </p>
        </div>
      );

    return hint.templates ? (<Template/>) :
    (
      <div className={this.classNames}>
        {content}
        {action}
        <span className='close-hint' onClick={this.props.clearHints.bind(null, '')}>
          <Icon glyph={assets.close} />
        </span>
      </div>
    );
  };
};

export const Hints = connect(
  mapStateToProps,
  mapDispatchToProps
)(BaseHints);
