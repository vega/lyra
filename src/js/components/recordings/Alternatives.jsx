'use strict';

var React = require('react'),
    ReactCSSTransitionGroup = require('react-addons-css-transition-group'),
    Immutable = require('immutable'),
    connect = require('react-redux').connect,
    Icon = require('../Icon'),
    recordingActions = require('../../actions/recordingActions'),
    defineSelection = recordingActions.defineSelection,
    assets = require('../../util/assets'),
    SEL_TYPES = require('../../constants/selectionTypes'),
    getIn = require('../../util/immutable-utils').getIn;

function mapStateToProps(reduxState, ownProps) {
  var path = 'recordings.' + ownProps.type;
  return {
    def:  getIn(reduxState, path + '.def.' + ownProps.defKey),
    alts: getIn(reduxState, path + '.' + ownProps.altKey)
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    define: function(value) {
      dispatch(defineSelection(ownProps.type, ownProps.defKey, value));
    }
  };
}

var Alternatives = React.createClass({
  propTypes: {
    type: SEL_TYPES.isRequired,
    defKey: React.PropTypes.oneOf(['on', 'project']).isRequired,
    altKey: React.PropTypes.oneOf(['events', 'project']).isRequired,
    lede: React.PropTypes.string,
    def: React.PropTypes.string,
    alts: React.PropTypes.instanceOf(Immutable.Map),
    label: React.PropTypes.func,
    define: React.PropTypes.func,
  },

  getInitialState: function() {
    return {open: false};
  },

  toggle: function() {
    this.setState({open: !this.state.open});
  },

  // Sort event suggestions descending by score (i.e., highest scoring first).
  // If they have matching scores, sort by ascending timestamp (i.e., oldest
  // first) to churn the UI only when scores decay sufficiently.
  score: function(a, b) {
    var sa = a[1].get('_score'),
        sb = b[1].get('_score');

    if (sa === sb) {
      return a[1].get('_ts') - b[1].get('_ts');
    }

    return sb - sa;
  },

  selectAlt: function(evtKey) {
    this.props.define(evtKey);
    this.setState({open: false});
  },

  render: function() {
    var props  = this.props,
        alts = props.alts.entrySeq().sort(this.score),
        def = props.def ? props.alts.get(props.def) : alts.first()[1],
        defName = props.label(def),
        open = this.state.open;

    alts = alts.filter(function(alt) {
      return alt[1] !== def;
    });

    var count = alts.count(),
        glyph = assets[open ? 'group-open' : 'group-closed'];

    return (
      <ul>
        <li className={'selected count-' + count} onClick={this.toggle}>
          <Icon glyph={glyph} />
          {props.lede}

          <ReactCSSTransitionGroup transitionName="yf-text"
            transitionEnterTimeout={1500} transitionLeave={false}>
              <span key={defName} className="def">{defName}</span>
          </ReactCSSTransitionGroup>

          <ReactCSSTransitionGroup transitionName="yf-bg"
            transitionEnterTimeout={1000} transitionLeave={false}>
              <span key={'' + count} className="count">{count}</span>
          </ReactCSSTransitionGroup>
        </li>


        {open ? alts.map(function(alt) {
          return (
            <li key={alt[0]} className="event alternative"
              onClick={this.selectAlt.bind(this, alt[0])}>
              <span className="def">{props.label(alt[1])}</span>
            </li>
          );
        }, this) : null}
      </ul>
    );
  }
});

module.exports = connect(mapStateToProps, mapDispatchToProps)(Alternatives);
