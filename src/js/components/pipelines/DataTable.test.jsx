/* eslint no-unused-expressions:0,new-cap:0 */
'use strict';

var React = require('react'),
    expect = require('chai').expect,
    enzyme = require('enzyme'),
    shallow = enzyme.shallow,
    DataTable = require('./DataTable'),
    wrapper;

describe('DataTable Component <DataTable/>'),
function() {
  describe('Default state', function() {
    // Tests initial values of states

    beforeEach(function() {
      wrapper = shallow(<DataTable />);
    });

    it('valid init limit', function() {
      expect(wrapper.state('limit').to.be.above(0));
    });

    it('valid init page', function() {
      expect(wrapper.state('page').to.equal(0));
    });

  });
}
