/* eslint no-unused-expressions:0 */
'use strict';

var expect = require('chai').expect;
var React = require('react');
var enzyme = require('enzyme');
var Line = require('./Line');
var Property = require('./Property');
var wrapper;

// this is shallow rendered tested since all the work is done in property.js
describe('Line Inspector <Line/> (shallow)', function() {
  beforeEach(function() {
    var mock = {
      from: {
        data: 'dummy_data'
      },
      properties: {
        update: {
          x: {value: 25},
          y: {value: 25},
          fill: {value: '#4682b4'},
          fillOpacity: {value: 1},
          stroke: {value: '#000000'},
          strokeWidth: {value: 0.25}
        }
      }
    };
    wrapper = enzyme.shallow(<Line primitive={mock}/>);
  });

  it('renders as a <div>', function() {
    expect(wrapper.type()).to.eql('div');
  });

  it('it should render 4 <Property/> components', function() {
    expect(wrapper.find(Property)).to.have.length(4);
  });

  it('it should render 2 h4 tags', function() {
    expect(wrapper.find('h4')).to.have.length(2);
  });
});


