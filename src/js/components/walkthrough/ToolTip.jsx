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
// <<<<<<< HEAD
        markupComponent = options.markupComponent,
        media = props.media ? (<div className="media">
          {props.media}
        </div>) : null,
        instructions = props.instructions ? (<div className="instructions">
            <strong>Instructions</strong>
            <ul>
              {props.instructions.map(function(o, k) {
                return (<li key={k}><strong>{k + 1}</strong> - {o}</li>);
              })}
            </ul>
          </div>) : null,
        inner;
// =======
//         inner,
//         markupComponent = options.markupComponent;
// >>>>>>> a95677eb24ab61fa0193abc475e2f814601a35d5

    // switch block or find
    if (markupComponent && markupComponent === 'MarksList') {
      inner = (
        <div>
{/* <<<<<<< HEAD */}
          {props.text}<br />
          {instructions}
          {media}
          <MarksList />
        </div>);
    } else {
      inner = (<div>

        {props.text}<br />
        {instructions}
        {media}
      </div>);
// =======
//           {props.text}
//           <MarksList />
//         </div>);
//     } else {
//       inner = props.text;
// >>>>>>> a95677eb24ab61fa0193abc475e2f814601a35d5
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
{/* <<<<<<< HEAD */}
          {props.error}
          {inner}
{/* =======
          {inner}
          {props.error}
>>>>>>> a95677eb24ab61fa0193abc475e2f814601a35d5 */}
        </div>
        <div className="footer">
          {props.control}
        </div>
      </div>
    );
  }
});

module.exports = ToolTip;
