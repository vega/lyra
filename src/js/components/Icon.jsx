'use strict';
var React = require('react'),
    createReactClass = require('create-react-class');

var Icon = createReactClass({
  render: function() {
    var props = this.props,
        className = (props.className ? props.className + ' ' : '') + 'icon';

    return (
      <svg className={className} onClick={props.onClick}
        width={props.width || 13} height={props.height || 13}
        data-html={props['data-html']} data-tip={props['data-tip']}
        data-place={props['data-place']}>
        <use xlinkHref={props.glyph} />
      </svg>
    );
  }
});

module.exports = Icon;
