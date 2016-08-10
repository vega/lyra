'use strict';

var expect = require('chai').expect,
    enzyme = require('enzyme'),
    shallow = enzyme.shallow,
    React = require('react'),
    TextArea = require('./TextArea');

describe('TextArea Component <TextArea />', function() {
  var wrapper;

  beforeEach(function() {
    wrapper = shallow(<TextArea />);
  });

  describe('Default state', function() {
    
  });
});
