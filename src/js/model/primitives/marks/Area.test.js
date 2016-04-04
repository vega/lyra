/* eslint no-unused-expressions:0 */
'use strict';
var expect = require('chai').expect;
var Area = require('./Area');
var Mark = require('./Mark');
var VLSingle = require('../../rules/VLSingle');

describe('Area Mark Primitive', function() {
  var area;

  describe('defaultProperties static method', function() {

    it('is a function', function() {
      expect(Area).to.have.property('defaultProperties');
      expect(Area.defaultProperties).to.be.a('function');
    });

    it('returns the expected default properties object', function() {
      var result = Area.defaultProperties();
      expect(result).to.deep.equal({
        type: 'area',
        properties: {
          update: {
            x: {value: 25},
            y: {value: 25},
            fillOpacity: {value: 1},
            strokeWidth: {value: 0.25},
            x2: {value: 0},
            y2: {value: 0},
            xc: {value: 60, _disabled: true},
            yc: {value: 60, _disabled: true},
            tension: {value: 13},
            interpolate: {value: 'monotone'},
            fill: {value: '#55498D'},
            stroke: {value: '#55498D'},
            orient: {value: 'vertical'},
            width: {value: 30, _disabled: true},
            height: {value: 30, _disabled: true}
          }
        }
      });
    });

  });

  describe('constructor', function() {

    beforeEach(function() {
      area = new Area();
    });

    it('is a constructor function', function() {
      expect(Area).to.be.a('function');
    });

    it('may be used to create group instances', function() {
      expect(area).to.be.an.instanceOf(Area);
    });

    it('inherits from Mark', function() {
      expect(area).to.be.an.instanceOf(Mark);
    });

    it('initializes instance with a .type property of "area"', function() {
      expect(area).to.have.property('type');
      expect(area.type).to.be.a('string');
      expect(area.type).to.equal('area');
    });

    it('initializes instance with an appropriate .name property', function() {
      expect(area).to.have.property('name');
      expect(area.name).to.be.a('string');
      expect(area.name.startsWith('area_')).to.be.true;
    });

    it('initializes instance with default vega properties', function() {
      var defaults = Area.defaultProperties().properties;
      expect(area).to.have.property('properties');
      expect(area.properties).to.be.an('object');
      expect(area.properties).to.deep.equal(defaults);
    });

    it('initializes instance with a numeric _id', function() {
      expect(area).to.have.property('_id');
      expect(area._id).to.be.a('number');
    });

    it('does not initialize instance with a .from property', function() {
      expect(area.from).to.be.undefined;
    });

    it('initializes instance with a ._rule object', function() {
      expect(area).to.have.property('_rule');
      expect(area._rule).to.be.an('object');
      expect(area._rule).to.be.an.instanceOf(VLSingle);
    });
  });

  describe('constructor with non-default properties', function() {

    beforeEach(function() {
      area = new Area({
        type: 'area',
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
      expect(area).to.have.property('name');
      expect(area.name).to.be.a('string');
      expect(area.name).to.equal('Spartacus');
    });

    it('initializes instance with the _id from the provided props object', function() {
      expect(area).to.have.property('_id');
      expect(area._id).to.be.a('number');
      expect(area._id).to.equal(2501);
    });

    it('initializes instance with the .properties from the provided props object', function() {
      expect(area).to.have.property('properties');
      expect(area.properties).to.deep.equal({
        update: {
          fill: '#ff000'
        }
      });
    });

    it('still initializes instance with a ._rule object', function() {
      expect(area).to.have.property('_rule');
      expect(area._rule).to.be.an('object');
      expect(area._rule).to.be.an.instanceOf(VLSingle);
    });

  });

  describe('export method', function() {

    beforeEach(function() {
      area = new Area();
    });

    it('areas initialized w/ dummy data', function() {
      var exported = area.export(false);
      expect(exported).to.have.property('from');
      expect(exported.from).to.deep.equal({data: 'dummy_data_area'});
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
