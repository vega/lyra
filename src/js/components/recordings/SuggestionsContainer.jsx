'use strict';

var React = require('react'),
    connect = require('react-redux').connect,
    SelectionSuggestion = require('./SelectionSuggestion'),
    getIn = require('../../util/immutable-utils').getIn;

function mapStateToProps(reduxState) {
  return {
    active: getIn(reduxState, 'recordings.active'),
    point: !getIn(reduxState, 'recordings.point.events').isEmpty(),
    list:  !getIn(reduxState, 'recordings.list.events').isEmpty(),
    interval: !getIn(reduxState, 'recordings.interval.events').isEmpty()
  };
}

var SuggestionsContainer = React.createClass({
  render: function() {
    var props = this.props,
        point = props.point,
        list  = props.list,
        interval = props.interval,
        header, content;

    if (!point && !list && !interval) {
      header = 'Suggested Selections';
      content = (
        <p>Begin interacting with the visualization to get some suggestions.</p>
      );
    } else {
      header = 'Select...';
      content = (
        <div>
          {interval ? <SelectionSuggestion type="interval" /> : null}
          {list ? <SelectionSuggestion type="list" /> : null}
          {point ? <SelectionSuggestion type="point" /> : null}
        </div>
      );
    }

    return props.active ? (
      <div className="recordings hints">
        <h4>{header}</h4>

        {content}
      </div>
    ) : null;
  }
});

module.exports = connect(mapStateToProps)(SuggestionsContainer);
