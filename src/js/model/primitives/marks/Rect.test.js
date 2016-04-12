/* eslint no-unused-expressions:0 */
'use strict';
var expect = require('chai').expect;
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

    it('merged any provided options into the returned properties object', function() {
      var result = Rect.defaultProperties({
        _parent: 15
      });
      expect(result).to.have.property('_parent');
      expect(result._parent).to.equal(15);
    });

    it('overwrites default properties with those in the provided props object', function() {
      var result = Rect.defaultProperties({
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

    it('does not initialize instance with a numeric _id by default', function() {
      expect(rect).not.to.have.property('_id');
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

  describe('getHandleStreams static method', function() {
    var getHandleStreams;

    beforeEach(function() {
      getHandleStreams = Rect.getHandleStreams;
    });

    it('is a function', function() {
      expect(getHandleStreams).to.be.a('function');
    });

    it('returns a stream signal definitions dictionary object', function() {
      var result = getHandleStreams({
        _id: 2501,
        type: 'rect'
      });
      expect(result).to.be.an('object');
    });

    it('keys the stream signal definitions dictionary object by signal name', function() {
      var result = getHandleStreams({
        _id: 2501,
        type: 'rect'
      });
      expect(Object.keys(result).sort()).to.deep.equal([
        'lyra_rect_2501_height',
        'lyra_rect_2501_width',
        'lyra_rect_2501_x',
        'lyra_rect_2501_x2',
        'lyra_rect_2501_xc',
        'lyra_rect_2501_y',
        'lyra_rect_2501_y2',
        'lyra_rect_2501_yc'
      ]);
    });

    it('sets each value to an array of signal objects', function() {
      var result = getHandleStreams({
        _id: 2501,
        type: 'rect'
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
