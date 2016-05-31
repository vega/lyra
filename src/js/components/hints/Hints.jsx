'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    getIn = require('../../util/immutable-utils').getIn,
    hintActions = require('../../actions/hintActions'),
    assets = require('../../util/assets'),
    Icon = require('../Icon');

function mapStateToProps(reduxState, ownProps) {
  return {
    displayHint: getIn(reduxState, 'hints.display')
  };
}
function mapDispatchToProps(dispatch, ownProps) {
  return {
    dispatchAction: function() {
      var action = this.props.displayHint.action;
      var actionProps = this.props.displayHint.action_props !== undefined ?
        this.props.displayHint.action_props : '';
      dispatch(action(actionProps));
      dispatch(hintActions.clearHints());
    },
    clearHints: function() {
      dispatch(hintActions.clearHints());
    }
  };
}

var Hints = React.createClass({
  propTypes: {
    displayHint: React.PropTypes.object,
    dispatchAction: React.PropTypes.func,
    clearHints: React.PropTypes.func
  },
  classNames: 'hints',
  render: function() {
    var hint = this.props.displayHint;
    // If there is an action in the displayHint object, show the action button.
    var action = hint.action ? (
        <a className="action button button-secondary" onClick={this.props.dispatchAction.bind(this, '')}>
          {hint.action_text}
        </a>
      ) : '';
    // Content is dependent on if the hint template exists
    var Template = hint.template;
    var content = Template ? (<Template/>) :
      (
        <div>
          <h4 className="hint-header">{hint.title}</h4>
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
        <span className="close-hint" onClick={this.props.clearHints.bind(null, '')}>
          <Icon glyph={assets.close} />
        </span>
      </div>
    );
  }
});

module.exports = connect(mapStateToProps, mapDispatchToProps)(Hints);
