'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    getIn = require('../../util/immutable-utils').getIn,
    assets = require('../../util/assets'),
    Icon = require('../Icon');


function mapStateToProps(reduxState, ownProps) {
  return {
    displayHint: getIn(reduxState, 'hint.display')
  };
}
function mapDispatchToProps(dispatch, ownProps) {
  return {
  };
}

// Splitting each sidebar into its column
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

module.exports = connect(mapStateToProps, mapDispatchToProps)(Hints);
