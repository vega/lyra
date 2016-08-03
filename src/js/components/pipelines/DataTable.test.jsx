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

  // Tests initial values of states
  describe('Default state', function() {

    beforeEach(function() {
      wrapper = shallow(<DataTable />);
    });

    it('valid init limit', function() {
      expect(wrapper.state('limit').to.be.above(0));
    });

    it('valid init page', function() {
      expect(wrapper.state('page').to.equal(0));
    });

    it('valid init hoverField', function() {
      expect(wrapper.state('hoverField').to.equal(null));
    });

    it('valid init hoverValue', function() {
      expect(wrapper.state('hoverValue').to.equal(null));
    });

    it('calls componentDidMount', function() {
      expect(DataTable.prototype.componentDidMount.calledOnce).to.equal(true);
  });

  });

  // Tests case where click next once and ensure all states correct
  describe('Pagination next', function() {
    before(function() {
      wrapper = shallow(<DataTable />);
      wrapper.find('Icon').simulate('click'); // should click on next since only one that initially exists
    });

    it('correct next page', function() {
      expect(wrapper.state('page').to.equal(1));
    });


  });

  // Tests case where click next then prev
  describe('next then prev', function() {

  });

  // Tests showHoverField
  describe('showHoverField', function() {

  });

  // Tests showHoverValue
  describe('showHoverValue', function() {

  });

  // Tests hideHover
  describe('hideHover', function() {

  });
}
