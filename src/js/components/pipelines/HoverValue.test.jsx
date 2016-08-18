/* eslint no-unused-expressions:0,new-cap:0 */
'use strict';

var React = require('react'),
    expect = require('chai').expect,
    enzyme = require('enzyme'),
    shallow = enzyme.shallow,
    d3 = require('d3'),
    HoverValue = require('./HoverValue'),
    wrapper;

describe('HoverValue Component <HoverValue/>', function() {

  beforeEach(function() {
    var event = { target: 'test' };
    wrapper = shallow(<HoverValue evt={event}/>);
  });

  // Renders component correctly
  describe('Render', function() {

    it('renders div', function() {

    });

  });

});
