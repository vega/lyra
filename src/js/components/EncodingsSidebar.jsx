'use strict';
var React = require('react'),
    ScaleList = require('./encodings/ScaleList'),
    GroupList = require('./encodings/GroupList');

var EncodingsSidebar = React.createClass({
  render: function() {
    return (
      <div className="sidebar" id="visual-sidebar">
        <GroupList ref="groupList" />
        <ScaleList ref="scaleList"/>
      </div>
    );
  }
});

module.exports = EncodingsSidebar;
