'use strict';
var React = require('react'),
    ScaleList = require('./encodings/ScaleList'),
    GroupList = require('./encodings/GroupList'),
    createReactClass = require('create-react-class');

var EncodingsSidebar = createReactClass({
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
