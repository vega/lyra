/* eslint no-unused-expressions:0,new-cap:0 */
'use strict';

var React = require('react'),
    expect = require('chai').expect,
    enzyme = require('enzyme'),
    shallow = enzyme.shallow,
    FieldType = require('./FieldType'),
    measureTypes = require('../../constants/measureTypes'),
    wrapper;

describe('FieldType Component <FieldType/>', function() {

  beforeEach(function() {
    var field = { mtype: measureTypes[0] };
    wrapper = shallow(<FieldType field={field} />);
  });

  describe('Default state', function() {

    it('valid init type', function() {
      expect(wrapper.state('type')).to.be.null;
    });

  });

  // Renders component correctly
  describe('Render', function() {

    it('renders Icon', function() {
      expect(wrapper.find('Icon')).to.have.length(1);
    });

  });

  // Tests change type
  describe('changeType', function() {

    it('basic changeType', function() {
      var prevType = wrapper.state('type');
      wrapper.find('Icon').simulate('click');
      var nextType = wrapper.state('type');
      expect(prevType).to.not.equal(nextType);
    });

    it('changeType', function() {
      wrapper.find('Icon').simulate('click');
      var prevType = wrapper.state('type'),
          prevIdx = measureTypes.indexOf(prevType),
          corrType = measureTypes[(prevIdx + 1) % measureTypes.length];
      wrapper.find('Icon').simulate('click');
      var nextType = wrapper.state('type');
      expect(corrType).to.equal(nextType);
    });

  });
});
