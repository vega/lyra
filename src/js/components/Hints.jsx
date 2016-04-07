'use strict';
var React = require('react'),
    assets = require('../util/assets'),
    Icon = require('./Icon');

var Hints = React.createClass({
  classNames: 'hints',
  render: function() {
    return (
      <div className={this.classNames}>
        <h3 className="hint-header">HINT! Looks like you're... </h3>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas posuere ipsum urna,
          id ultricies arcu hendrerit ut.
        </p>
        <Icon glyph={assets.close} />
      </div>
    );
  }
});

module.exports = Hints;
