'use strict';
var React = require('react');

var Icon = React.createClass({
  render: function() {
    var props = this.props,
        className = (props.className ? props.className + ' ' : '') + 'icon';

    return (
      <svg className={className} onClick={props.onClick}
        width={props.width || 13} height={props.height || 13}
        data-html={props['data-html']} data-tip={props['data-tip']}
        data-place={props['data-place']} style={props.style}>
        <use xlinkHref={props.glyph} />
      </svg>
    );
  }
});

module.exports = Icon;
