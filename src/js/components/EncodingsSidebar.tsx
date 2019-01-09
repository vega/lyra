import GroupList from './encodings/GroupList';

'use strict';
let React = require('react'),
    ScaleList = require('./encodings/ScaleList'),
    createReactClass = require('create-react-class');

let EncodingsSidebar = createReactClass({
  render: function() {
    return (
      <div className='sidebar' id='visual-sidebar'>
        <GroupList ref='groupList' />
        <ScaleList ref='scaleList'/>
      </div>
    );
  }
});

module.exports = EncodingsSidebar;
