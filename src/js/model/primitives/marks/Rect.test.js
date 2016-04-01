/* eslint no-unused-expressions:0 */
'use strict';
var expect = require('chai').expect;
var assert = require('chai').assert;
var Rect = require('./Rect');
var Mark = require('./Mark');
var VLSingle = require('../../rules/VLSingle');

describe('Rect Mark Primitive', function() {
  var rect;

  describe('defaultProperties static method', function() {

    it('is a function', function() {
      expect(Rect).to.have.property('defaultProperties');
      expect(Rect.defaultProperties).to.be.a('function');
    });

    it('returns the expected default properties object', function() {
      var result = Rect.defaultProperties();
      expect(result).to.deep.equal({
        type: 'rect',
        properties: {
          update: {
            x: {value: 25},
            y: {value: 25},
            x2: {value: 60},
            y2: {value: 60},
            xc: {value: 60, _disabled: true},
            yc: {value: 60, _disabled: true},
            width: {value: 30, _disabled: true},
            height: {value: 30, _disabled: true},
            fill: {value: '#4682b4'},
            fillOpacity: {value: 1},
            stroke: {value: '#000000'},
            strokeWidth: {value: 0.25}
          }
        }
      });
    });

  });

  describe('constructor', function() {

    beforeEach(function() {
      rect = new Rect();
    });

    it('is a constructor function', function() {
      expect(Rect).to.be.a('function');
    });

    it('may be used to create rect instances', function() {
      expect(rect).to.be.an.instanceOf(Rect);
    });

    it('inherits from Mark', function() {
      expect(rect).to.be.an.instanceOf(Mark);
    });

    it('initializes instance with a .type property of "rect"', function() {
      expect(rect).to.have.property('type');
      expect(rect.type).to.be.a('string');
      expect(rect.type).to.equal('rect');
    });

    it('initializes instance with an appropriate .name property', function() {
      expect(rect).to.have.property('name');
      expect(rect.name).to.be.a('string');
      expect(rect.name.startsWith('rect_')).to.be.true;
    });

    it('initializes instance with default vega properties', function() {
      expect(rect).to.have.property('properties');
      expect(rect.properties).to.be.an('object');
      expect(rect.properties).to.deep.equal({
        update: {
          x: {value: 25},
          y: {value: 25},
          x2: {value: 60},
          y2: {value: 60},
          xc: {value: 60, _disabled: true},
          yc: {value: 60, _disabled: true},
          width: {value: 30, _disabled: true},
          height: {value: 30, _disabled: true},
          fill: {value: '#4682b4'},
          fillOpacity: {value: 1},
          stroke: {value: '#000000'},
          strokeWidth: {value: 0.25}
        }
      });
    });

    it('initializes instance with a numeric _id', function() {
      expect(rect).to.have.property('_id');
      expect(rect._id).to.be.a('number');
    });

    it('does not initialize instance with a .from property', function() {
      expect(rect.from).to.be.undefined;
    });

    it('initializes instance with a ._rule object', function() {
      expect(rect).to.have.property('_rule');
      expect(rect._rule).to.be.an('object');
      expect(rect._rule).to.be.an.instanceOf(VLSingle);
    });
  });

  describe('constructor with non-default properties', function() {

    beforeEach(function() {
      rect = new Rect({
        type: 'rect',
        _id: 2501,
        name: 'Spartacus',
        properties: {
          update: {
            fill: '#ff000'
          }
        }
      });
    });

    it('initializes instance with the name from the provided props object', function() {
      expect(rect).to.have.property('name');
      expect(rect.name).to.be.a('string');
      expect(rect.name).to.equal('Spartacus');
    });

    it('initializes instance with the _id from the provided props object', function() {
      expect(rect).to.have.property('_id');
      expect(rect._id).to.be.a('number');
      expect(rect._id).to.equal(2501);
    });

    it('initializes instance with the .properties from the provided props object', function() {
      expect(rect).to.have.property('properties');
      expect(rect.properties).to.deep.equal({
        update: {
          fill: '#ff000'
        }
      });
    });

    it('still initializes instance with a ._rule object', function() {
      expect(rect).to.have.property('_rule');
      expect(rect._rule).to.be.an('object');
      expect(rect._rule).to.be.an.instanceOf(VLSingle);
    });

  });

});
