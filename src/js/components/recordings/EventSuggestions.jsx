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
    def: getIn(reduxState, path + '.def.on'),
    events: getIn(reduxState, path + '.events')
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    define: function(evtKey) {
      dispatch(defineSelection(ownProps.type, 'on', evtKey));
    }
  };
}

var EventSuggestions = React.createClass({
  propTypes: {
    type: SEL_TYPES.isRequired,
    def: React.PropTypes.string,
    events: React.PropTypes.instanceOf(Immutable.Map),
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

  eventName: function(event) {
    var type = event.get('type'),
        filters = event.get('filters');

    return filters.size === 0 ? type :
      filters.valueSeq().map(function(f) {
        return f.replace('event.', '').replace('Key', '');
      }).join('-') + '-' + type;
  },

  selectEvent: function(evtKey) {
    this.props.define(evtKey);
    this.setState({open: false});
  },

  render: function() {
    var props  = this.props,
        events = props.events.entrySeq().sort(this.score),
        def = props.def ? props.events.get(props.def) : events.first()[1],
        defName = this.eventName(def),
        open = this.state.open;

    events = events.filter(function(event) {
      return event[1] !== def;
    });

    var count = events.count(),
        glyph = assets[open ? 'group-open' : 'group-closed'];

    return (
      <ul>
        <li className={'selected count-' + count} onClick={this.toggle}>
          <Icon glyph={glyph} />
          on

          <ReactCSSTransitionGroup transitionName="yf-text"
            transitionEnterTimeout={1500} transitionLeave={false}>
              <span key={defName} className="def">{defName}</span>
          </ReactCSSTransitionGroup>

          <ReactCSSTransitionGroup transitionName="yf-bg"
            transitionEnterTimeout={1000} transitionLeave={false}>
              <span key={'' + count} className="count">{count}</span>
          </ReactCSSTransitionGroup>
        </li>


        {open ? events.map(function(event) {
          return (
            <li key={event[0]} className="event alternative"
              onClick={this.selectEvent.bind(this, event[0])}>
              <span className="def">{this.eventName(event[1])}</span>
            </li>
          );
        }, this) : null}
      </ul>
    );
  }
});

module.exports = connect(mapStateToProps, mapDispatchToProps)(EventSuggestions);
