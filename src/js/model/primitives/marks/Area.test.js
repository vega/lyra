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

    it('merged any provided options into the returned properties object', function() {
      var result = Area.defaultProperties({
        _parent: 15
      });
      expect(result).to.have.property('_parent');
      expect(result._parent).to.equal(15);
    });

    it('overwrites default properties with those in the provided props object', function() {
      var result = Area.defaultProperties({
        properties: {
          update: {
            x: {value: 500}
          }
        }
      });
      expect(result.properties).to.deep.equal({
        update: {
          x: {value: 500}
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

    it('does not initialize instance with a numeric _id by default', function() {
      expect(area).not.to.have.property('_id');
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

  describe('getHandleStreams static method', function() {
    var getHandleStreams;

    beforeEach(function() {
      getHandleStreams = Area.getHandleStreams;
    });

    it('is a function', function() {
      expect(getHandleStreams).to.be.a('function');
    });

    it('returns a stream signal definitions dictionary object', function() {
      var result = getHandleStreams({
        _id: 2501,
        type: 'area'
      });
      expect(result).to.be.an('object');
    });

    it('keys the stream signal definitions dictionary object by signal name', function() {
      var result = getHandleStreams({
        _id: 2501,
        type: 'area'
      });
      expect(Object.keys(result).sort()).to.deep.equal([
        'lyra_area_2501_height',
        'lyra_area_2501_width',
        'lyra_area_2501_x',
        'lyra_area_2501_x2',
        'lyra_area_2501_xc',
        'lyra_area_2501_y',
        'lyra_area_2501_y2',
        'lyra_area_2501_yc'
      ]);
    });

    it('sets each value to an array of signal objects', function() {
      var result = getHandleStreams({
        _id: 2501,
        type: 'area'
      });
      Object.keys(result).forEach(function(key) {
        expect(result[key]).to.be.an('array');
        result[key].forEach(function(def) {
          expect(def).to.have.property('type');
          expect(def.type).to.equal('lyra_delta');
          expect(def).to.have.property('expr');
          expect(def.expr).to.be.a('string');
        });
      });
    });

  });

});
