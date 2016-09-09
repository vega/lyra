'use strict';
var React = require('react'),
    marksList = require('../../constants/walkthrough').marksList;

var TooltipMarkup = React.createClass({
  getInitialState: function() {
    return {
      description: {
        display: 'none'
      }
    };
  },
  showDescription: function(id, desClass) {
    desClass = '.' + desClass;
    var descriptions = document.querySelectorAll(desClass),
        selected = document.getElementById(id);

    selected.classList.add('show');

    for (var i = 0; i <= descriptions.length; i++) {
      if (descriptions[i].id !== id) {
        descriptions[i].classList.remove('show');
      }
    }
  },
  render: function() {
    var data = marksList,
        inner;

    if (data) {
      inner = (
        <ul className="marksList">
          {
            data.map(function(item, key) {
              var desId = 'description_' + key,
                  desClass = 'markDescription';
              return (
                <li key={key} onClick={this.showDescription.bind(this, desId, desClass)}>
                  <label>{item.mark}</label>
                  <p ref={desId} id={desId} className={desClass}>{item.description}</p>
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
