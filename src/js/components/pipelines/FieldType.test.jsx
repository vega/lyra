/* eslint no-unused-expressions:0,new-cap:0 */
'use strict';

var React = require('react'),
    expect = require('chai').expect,
    enzyme = require('enzyme'),
    shallow = enzyme.shallow,
    DataTable = require('./FieldType'),
    wrapper;

describe('FieldType Component <FieldType/>'), function() {

  // Tests initial values of states
  describe('Default state', function() {

    beforeEach(function() {
      wrapper = shallow(<FieldType />);
    });

  });
}
