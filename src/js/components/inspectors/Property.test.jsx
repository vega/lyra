/* eslint no-unused-expressions:0 */
'use strict';

var expect = require('chai').expect;
var React = require('react');
var enzyme = require('enzyme');
var Rect = require('../../model/primitives/marks/Rect');
var Property = require('./Property');
var wrapper;

describe('Property Inspector <Property/>', function() {
  describe('Property Inspector <Property type="color"/> (shallow)', function() {
    beforeEach(function() {
      wrapper = enzyme.shallow(<Property
        name = "stroke"
        label = "Color"
        type = "color"
      />);
    });
    it('renders a color input', function() {
      expect(wrapper.find('input[type="color"]')).to.have.length(1);
    });
  });

  describe('Property Inspector <Property type="number"/> (shallow)', function() {
    beforeEach(function() {
      wrapper = enzyme.shallow(<Property
        name="y"
        label="Y"
        type="number"
      />);
    });

    it('renders a number input', function() {
      expect(wrapper.find('input[type="number"]')).to.have.length(1);
    });
  });

  describe('Property Inspector <Property type="range"/> (MOUNT)', function() {
    var inputNode;
    beforeEach(function() {
      var primitive = new Rect();
      wrapper = enzyme.mount(<Property
        name="fillOpacity"
        label="Opacity"
        type="range"
        min="0"
        max="1"
        step="0.05"
        primitive={primitive}
      />);
      inputNode = wrapper.find('input[type="range"]').node;
    });

    it('renders a range input', function() {
      expect(wrapper.find('input[type="range"]')).to.have.length(1);
    });

    it('range input has a max value', function() {
      expect(inputNode.getAttribute('max')).to.equal('1');
    });

    it('range input has a min value', function() {
      expect(inputNode.getAttribute('min')).to.equal('0');
    });

    it('range input has step set', function() {
      expect(inputNode.getAttribute('step')).to.equal('0.05');
    });
  });

  describe('Property Inspector <Property type="select"/> (mount)', function() {
    beforeEach(function() {
      var shapes = ['circle', 'square', 'cross', 'diamond', 'triangle-up', 'triangle-down'];
      wrapper = enzyme.mount(<Property
        name="shape"
        label="Shape"
        type="select"
        opts={shapes}
      />);
    });

    it('renders a select', function() {
      expect(wrapper.find('select')).to.have.length(1);
    });

    it('has 6 options', function() {
      expect(wrapper.find('select').node).to.have.length(6);
    });
  });
});
