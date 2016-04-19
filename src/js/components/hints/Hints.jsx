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
    dispatchAction: function(){
      var action = this.props.displayHint.action;
      var actionProps = this.props.displayHint.action_props || '';
      dispatch(action(actionProps));
      dispatch(hintActions.clearHints());
    },
    clearHints: function(){
      dispatch(hintActions.clearHints());
    }
  };
}

// Splitting each sidebar into its column
var Hints = React.createClass({
  classNames: 'hints',
  render: function() {
    var hint = this.props.displayHint;
    return (
      <div className={this.classNames}>
        <h3 className="hint-header">{hint.title}</h3>
        <p>
          {hint.text}
        </p>
        <a className="action" onClick={this.props.dispatchAction.bind(this, '')}>{hint.action_text}</a>
        <span className="close-hint" onClick={this.props.clearHints.bind(null,'')}>
          <Icon glyph={assets.close} />
        </span>
      </div>
    );
  }
});

module.exports = connect(mapStateToProps, mapDispatchToProps)(Hints);
