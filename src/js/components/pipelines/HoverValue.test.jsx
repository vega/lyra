/* eslint no-unused-expressions:0,new-cap:0 */
'use strict';

var React = require('react'),
    expect = require('chai').expect,
    enzyme = require('enzyme'),
    shallow = enzyme.shallow,
    HoverValue = require('./HoverValue'),
    wrapper;

describe('HoverValue Component <HoverValue/>', function() {

  beforeEach(function() {
    var hoverValue = { target: 'test'};
    wrapper = shallow(<HoverValue />);
  });

  // Renders component correctly
  describe('Render', function() {

    it('renders div', function() {
      //expect(wrapper.type()).to.equal('div');
    });

    // it('it should render div for each group', function() {
    //   expect(wrapper.find('div')).to.have.length(1);
    // });

  });

});
