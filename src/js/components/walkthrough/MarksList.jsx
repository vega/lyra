'use strict';
var React = require('react'),
    Icon = require('../Icon'),
    marksList = require('../../constants/walkthrough').marksList,
    close = require('../../util/assets').close;

var TooltipMarkup = React.createClass({
  getInitialState: function() {
    return {
      description: {
        display: 'none'
      }
    };
  },
  render: function() {
    var state = this.state,
        data = marksList,
        inner;

    if (data) {
      inner = (
        <ul>
          {
            data.map(function(item, i) {
              return (
                <li key={i}>
                  <strong>{item.mark}</strong>
                  <p key={i}>{item.description}</p>
                </li>
              );
            }, this)
          }
        </ul>
      );
    }

    return (
      <div>
        {inner}
      </div>
    );
  }
});

module.exports = TooltipMarkup;
