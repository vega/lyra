'use strict';
var React = require('react'),
    Icon = require('../Icon'),
    MarksList = require('./MarksList'),
    close = require('../../util/assets').close;

var ToolTip = React.createClass({
  propTypes: {
    position: React.PropTypes.object.isRequired,
    steps: React.PropTypes.object,
    marks: React.PropTypes.object,
    goToNext: React.PropTypes.func,
    deselectWalkthrough: React.PropTypes.func
  },
  getInitialState: function() {
    return {
      position: this.props.position
    };
  },
  render: function() {
    var props = this.props,
        options = props.options,
        position = props.position,
        orient = position.orient,
        toolTipStyle = {
          top: position.top,
          left: position.left
        },
        toolTipArrowStyle = position.arrow,
        toolTipClassnames = 'popover in ' + orient,
        inner,
        markupComponent = options.markupComponent;

    // switch block or find
    if (markupComponent && markupComponent === 'MarksList') {
      inner = (
        <div>
          {props.text}
          <MarksList />
        </div>);
    } else {
      inner = props.text;
    }

    return (
      <div className={toolTipClassnames} style={toolTipStyle} role="tooltip">
        <div className="arrow" style={toolTipArrowStyle}></div>
        <div className="title">
          <h3>{props.title}</h3>
          <span onClick={props.quit} className="exit">
            <Icon glyph={close} />
          </span>
        </div>
        <div className="content">
          {inner}
          {props.error}
        </div>
        <div className="footer">
          {props.control}
        </div>
      </div>
    );
  }
});

module.exports = ToolTip;
