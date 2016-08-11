'use strict';

var expect = require('chai').expect,
    enzyme = require('enzyme'),
    shallow = enzyme.shallow,
    React = require('react'),
    TextArea = require('./TextArea');

describe('TextArea Component <TextArea />', function() {
  var name = 'textArea',
      wrapper,
      mockChangeHandler;

  beforeEach(function() {
    mockChangeHandler = function() {};
    wrapper = shallow(<TextArea changeHandler={mockChangeHandler} name={name} />);
  });

  describe('Default state', function() {
    it('isn\'t in drag mode', function() {
      expect(wrapper.state('dragActive')).to.equal('textarea-dnd');
    });

    it('has prop name', function() {
      expect(wrapper.prop('')).to.have.length(1);
    });
  });
});
