'use strict';
var React = require('react'),
    Icon = require('../Icon'),
    close = require('../../util/assets').close;

var ToolTip = React.createClass({
  getInitialState: function() {
    return {
      position: {
        x: -1000,
        y: -1000
      }
    };
  },
  componentWillReceiveProps: function(newProps) {
    var props = this.props,
        toolTipStyle = {},
        targetDomEl,
        boundingRect;

    if (props && props.target) {
      toolTipStyle.position = {};
      // get targetDomEl position
      targetDomEl = document.getElementById(props.target);
      boundingRect = targetDomEl.getBoundingClientRect();

      console.log('targetDomEl: ', targetDomEl);
      console.log(boundingRect.top, boundingRect.right, boundingRect.bottom, boundingRect.left);
      console.log(this.styles);
    }
  },
  componentDidUpdate: function(newProps) {
    console.log('newProps: ', newProps);
  },
  render: function() {
    var props = this.props,
        toolTipStyle;

    return (
      <div className="popover right in" role="tooltip">
        <div className="arrow" style={toolTipStyle}></div>
        <div className="popover-title">
          <h3>{props.title}</h3>
          <span className="close-hint" onClick={props.quit}>
            <Icon glyph={close} />
          </span>
        </div>
        <div className="popover-content">
          {props.text}
          {props.error}
        </div>
        <div className="popover-footer">
          {props.control}
        </div>
      </div>
    );
  }
});

module.exports = ToolTip;
