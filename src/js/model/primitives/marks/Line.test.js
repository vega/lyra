/* eslint no-unused-expressions:0 */
'use strict';
var expect = require('chai').expect;
var assert = require('chai').assert;
var Line = require('./Line');
var Mark = require('./Mark');

describe('Line Mark Primitive', function() {
  var line;
  beforeEach(function() {
    line = new Line();
  });

  describe('constructor', function() {
    it('is a constructor function', function() {
      expect(Line).to.be.a('function');
    });

    it('may be used to create group instances', function() {
      expect(line).to.be.an.instanceOf(Line);
    });

    it('inherits from Mark', function() {
      expect(line).to.be.an.instanceOf(Mark);
    });
  });

  describe('default properties', function() {

    it('is initialized with stroke', function() {
      var stroke = {value: '#000000'};
      expect(line.properties.update).to.have.property('stroke');
      assert.deepEqual(line.properties.update.stroke, stroke);
    });

    it('is initialized with strokeWidth', function() {
      var strokeWidth = {value: 3};
      expect(line.properties.update).to.have.property('strokeWidth');
      assert.deepEqual(line.properties.update.strokeWidth,strokeWidth);
    });

  });

  describe('initHandles method', function() {

  });


  describe('export method', function() {

    it('lines initialized w/ dummy data', function() {
      var exported = line.export(false);
      expect(exported).to.have.property('from');
      assert.deepEqual(exported.from, { data: 'dummy_data' });
    });

    it('lines spec does not have fill property', function() {
      var exported = line.export(false);
      expect(exported.properties.update).to.not.have.property('fill');
    });

    it('lines spec does not have fillOpacity property', function() {
      var exported = line.export(false);
      expect(exported.properties.update).to.not.have.property('fillOpacity');
    });

  });

});
