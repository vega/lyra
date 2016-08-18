'use strict';

var React = require('react'),
    EventSuggestions = require('./EventSuggestions'),
    SEL_TYPES = require('../../constants/selectionTypes');

var SelectionSuggestion = React.createClass({
  propTypes: {
    type: SEL_TYPES.isRequired,
  },

  headers: {
    point: (<h5>a <span className="type">single</span></h5>),
    list: (<h5><span className="type">multiple</span> different</h5>),
    interval: (<h5>an <span className="type">interval</span> of points</h5>)
  },

  render: function() {
    var props = this.props,
        type = props.type;

    return (
      <div className="selection">
        {this.headers[type]}

        <EventSuggestions {...props} />
      </div>
    );
  }
});

module.exports = SelectionSuggestion;
