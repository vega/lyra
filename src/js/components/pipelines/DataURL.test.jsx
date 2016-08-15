'use strict';

var expect = require('chai').expect,
    enzyme = require('enzyme'),
    shallow = enzyme.shallow,
    React = require('react'),
    DataURL = require('./DataURL');

describe('Form Component <DataURL />', function() {
  var wrapper;

  beforeEach(function() {
    wrapper = shallow(<DataURL />);
  });

  it('renders form', function() {
    expect(wrapper.find('form')).to.have.length(1);
  });
  it('renders input', function() {
    expect(wrapper.find('input[type="text"]')).to.have.length(1);
  });
  it('renders button', function() {
    expect(wrapper.find('button[type="submit"]')).to.have.length(1);
  });
});
