'use strict';
var React = require('react');


// Splitting each sidebar into its column
var Hints = React.createClass({
  classNames: 'hints',
  wt: function(){
    return new Walkthrough(wdata.example);
  },

  currentStep: function(){
    return this.wt.getCurrent();
  },

  currentStep: function(){
    return this.wt.getCurrent();
  },

  render: function() {
    var step = this.currentStep();
    var thumbnail = step.image ? (<img src={step.image} alt={step.alt_text}/>): null;
    return (
      <div className={this.classNames}>
        {thumbnail}
        <h3 className="hint-header">{step.title}</h3>
        <p>{step.text}</p>
        <i className="close-hint fa fa-times"></i>
        <button onClick={newWalkthrough.next.bind(newWalkthrough,'')}> next </button>
      </div>
    );
  }
});

module.exports = Hints;
