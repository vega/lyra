'use strict';
var React = require('react'),
    Icon = require('../Icon'),
    close = require('../../util/assets').close;

var Dialog = React.createClass({
  render: function() {
    var props = this.props;
    return (
      <div className="hints">
        {props.thumbnail}
        <div className="details">
          <h3 className="hint-header">{props.title}</h3>
          <p>{props.text}</p>
          {props.control}
          <span className="close-hint" onClick={props.quit}>
            <Icon glyph={close} />
          </span>
        </div>
        <ul className="step-dots">
         {props.steps.map(function(step, i) {
           var selected = (step.get('id') === props.currentId) ? 'selected' : '';
           return (<li key={i} className={selected}></li>);
         })}
        </ul>
        {props.error}
      </div>
    );
  }
});

module.exports = Dialog;
