/* eslint no-unused-expressions:0,new-cap:0 */
'use strict';

var React = require('react'),
    expect = require('chai').expect,
    enzyme = require('enzyme'),
    shallow = enzyme.shallow,
    DataTable = require('./HoverField'),
    wrapper;

describe('HoverField Component <HoverField/>'), function() {

  // Tests initial values of states
  describe('Default state', function() {

    beforeEach(function() {
      wrapper = shallow(<HoverField />);
    });

  });
}
