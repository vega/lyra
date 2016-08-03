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

    it('valid init fieldDef', function() {
      expect(wrapper.state('fieldDef').to.equal(null));
    });

    it('valid init offsetTop', function() {
      expect(wrapper.state('offsetTop').to.equal(null));
    });

    it('valid init bindField', function() {
      expect(wrapper.state('bindField').to.equal(null));
    });

  });
}
