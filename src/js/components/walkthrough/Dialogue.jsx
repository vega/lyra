'use strict';
var React = require('react'),
    Icon = require('../Icon'),
    close = require('../../util/assets').close;

var Dialog = React.createClass({
  render: function() {
// <<<<<<< HEAD
    var props = this.props,
        media = props.media ? (<div className="media">
          {props.media}
        </div>) : null,
        instructions = props.instructions ? (<div>
            <strong>Instructions</strong>
            <ul>
              {props.instructions.map(function(o, k) {
                return (<li><strong>{k + 1}</strong> - {o}</li>);
              })}
            </ul>
          </div>) : null;

// =======
//     var props = this.props;
// >>>>>>> a95677eb24ab61fa0193abc475e2f814601a35d5
    return (
      <div className="dialogue">
        <div className="title">
          <h3>{props.title}</h3>
          <span onClick={props.quit} className="exit">
            <Icon glyph={close} />
          </span>
        </div>
        <div className="hints">
          {props.error}
          {props.hints}
        </div>
        <div className="content">
          {props.text}
{/* <<<<<<< HEAD */}
          {instructions}
          {media}
{/* =======
>>>>>>> a95677eb24ab61fa0193abc475e2f814601a35d5 */}
        </div>
        <div className="footer">
          {props.control}
        </div>
      </div>
    );
  }
});

module.exports = Dialog;
