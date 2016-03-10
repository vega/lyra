/* eslint no-unused-expressions:0 */
'use strict';
var expect = require('chai').expect;
var assert = require('chai').assert;
var Area = require('./Area');
var Mark = require('./Mark');

describe('Area Mark Primitive', function() {
  var area;
  beforeEach(function() {
    area = new Area();
  });

  describe('constructor', function() {
    it('is a constructor function', function() {
      expect(Area).to.be.a('function');
    });

    it('may be used to create group instances', function() {
      expect(area).to.be.an.instanceOf(Area);
    });

    it('inherits from Mark', function() {
      expect(area).to.be.an.instanceOf(Mark);
    });
  });

  describe('default properties', function() {

    it('is initialized with stroke', function() {
      var stroke = {value: '#000000'};
      expect(area.properties.update).to.have.property('stroke');
      assert.deepEqual(area.properties.update.stroke, stroke);
    });

    it('is initialized with strokeWidth', function() {
      var strokeWidth = {value: 3};
      expect(area.properties.update).to.have.property('strokeWidth');
      assert.deepEqual(area.properties.update.strokeWidth, strokeWidth);
    });

  });


  describe('export method', function() {

    it('areas initialized w/ dummy data', function() {
      var exported = area.export(false);
      expect(exported).to.have.property('from');
      assert.deepEqual(exported.from, {data: 'dummy_data'});
    });

    it('areas spec does not have fill property', function() {
      var exported = area.export(false);
      expect(exported.properties.update).to.not.have.property('fill');
    });

    it('areas spec does not have fillOpacity property', function() {
      var exported = area.export(false);
      expect(exported.properties.update).to.not.have.property('fillOpacity');
    });

  });

});
