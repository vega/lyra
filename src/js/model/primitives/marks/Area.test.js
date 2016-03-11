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
      var stroke = {value: '#55498D'};
      expect(area.properties.update).to.have.property('stroke');
      assert.deepEqual(area.properties.update.stroke, stroke);
    });

    it('is initialized with fill', function() {
      var fill = {value: '#55498D'};
      expect(area.properties.update).to.have.property('fill');
      assert.deepEqual(area.properties.update.fill, fill);
    });

    it('is initialized with interpolate', function() {
      var interpolate = {value: 'monotone'};
      expect(area.properties.update).to.have.property('interpolate');
      assert.deepEqual(area.properties.update.interpolate, interpolate);
    });

    it('is initialized with orient', function() {
      var orient = {value: 'vertical'};
      expect(area.properties.update).to.have.property('orient');
      assert.deepEqual(area.properties.update.orient, orient);
    });
  });


  describe('export method', function() {

    it('areas initialized w/ dummy data', function() {
      var exported = area.export(false);
      expect(exported).to.have.property('from');
      assert.deepEqual(exported.from, {data: 'dummy_data_area'});
    });

  });

  describe('static property options lists', function() {
    it('exposes a static property defining interpolate options', function() {
      expect(Area).to.have.property('INTERPOLATE');
      var interpolate = [
        'linear',
        'step-before',
        'step-after',
        'basis',
        'basis-open',
        'cardinal',
        'cardinal-open',
        'monotone'
      ];
      expect(Area.INTERPOLATE).to.deep.equal(interpolate);
    });
    it('exposes a static property defining orient options', function() {
      expect(Area).to.have.property('ORIENT');
      expect(Area.ORIENT).to.deep.equal(['horizontal', 'vertical']);
    });
  });

});
