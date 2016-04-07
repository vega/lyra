/* eslint no-unused-expressions:0 */
'use strict';

var expect = require('chai').expect;

var Symbol = require('./Symbol');
var Mark = require('./Mark');
var VLSingle = require('../../rules/VLSingle');

describe('Symbol Mark Primitive', function() {
  var symbol;

  describe('defaultProperties static method', function() {

    it('is a function', function() {
      expect(Symbol).to.have.property('defaultProperties');
      expect(Symbol.defaultProperties).to.be.a('function');
    });

    it('returns the expected default properties object', function() {
      var result = Symbol.defaultProperties();
      expect(result).to.deep.equal({
        type: 'symbol',
        properties: {
          update: {
            x: {value: 25},
            y: {value: 25},
            fill: {value: '#4682b4'},
            fillOpacity: {value: 1},
            stroke: {value: '#000000'},
            strokeWidth: {value: 0.25},
            size: {value: 100},
            shape: {value: 'circle'}
          }
        }
      });
    });

    it('merged any provided options into the returned properties object', function() {
      var result = Symbol.defaultProperties({
        _parent: 15
      });
      expect(result).to.have.property('_parent');
      expect(result._parent).to.equal(15);
    });

    it('overwrites default properties with those in the provided props object', function() {
      var result = Symbol.defaultProperties({
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
      symbol = new Symbol();
    });

    it('is a constructor function', function() {
      expect(Symbol).to.be.a('function');
    });

    it('may be used to create symbol instances', function() {
      expect(symbol).to.be.an.instanceOf(Symbol);
    });

    it('inherits from Mark', function() {
      expect(symbol).to.be.an.instanceOf(Mark);
    });

    it('initializes instance with a .type property of "symbol"', function() {
      expect(symbol).to.have.property('type');
      expect(symbol.type).to.be.a('string');
      expect(symbol.type).to.equal('symbol');
    });

    it('initializes instance with an appropriate .name property', function() {
      expect(symbol).to.have.property('name');
      expect(symbol.name).to.be.a('string');
      expect(symbol.name.startsWith('symbol_')).to.be.true;
    });

    it('initializes instance with default vega properties', function() {
      expect(symbol).to.have.property('properties');
      expect(symbol.properties).to.be.an('object');
      expect(symbol.properties).to.deep.equal({
        update: {
          x: {value: 25},
          y: {value: 25},
          fill: {value: '#4682b4'},
          fillOpacity: {value: 1},
          stroke: {value: '#000000'},
          strokeWidth: {value: 0.25},
          size: {value: 100},
          shape: {value: 'circle'}
        }
      });
    });

    it('does not initialize instance with a numeric _id by default', function() {
      expect(symbol).not.to.have.property('_id');
    });

    it('does not initialize instance with a .from property', function() {
      expect(symbol.from).to.be.undefined;
    });

    it('initializes instance with a ._rule object', function() {
      expect(symbol).to.have.property('_rule');
      expect(symbol._rule).to.be.an('object');
      expect(symbol._rule).to.be.an.instanceOf(VLSingle);
    });

  });

  describe('Constructor with non-default properties', function() {

    beforeEach(function() {
      symbol = new Symbol({
        type: 'symbol',
        _id: 2501,
        name: 'Spartacus',
        properties: {
          update: {
            fill: '#010101'
          }
        }
      });
    });

    it('initializes instance with the name from the provided props object', function() {
      expect(symbol).to.have.property('name');
      expect(symbol.name).to.be.a('string');
      expect(symbol.name).to.equal('Spartacus');
    });

    it('initializes instance with the _id from the provided props object', function() {
      expect(symbol).to.have.property('_id');
      expect(symbol._id).to.be.a('number');
      expect(symbol._id).to.equal(2501);
    });

    it('initializes instance with the .properties from the provided props object', function() {
      expect(symbol).to.have.property('properties');
      expect(symbol.properties).to.deep.equal({
        update: {
          fill: '#010101'
        }
      });
    });

    it('still initializes instance with a ._rule object', function() {
      expect(symbol).to.have.property('_rule');
      expect(symbol._rule).to.be.an('object');
      expect(symbol._rule).to.be.an.instanceOf(VLSingle);
    });

  });

  describe('static property options lists', function() {

    it('exposes a static property defining alignment options', function() {
      expect(Symbol).to.have.property('SHAPES');
      expect(Symbol.SHAPES).to.deep.equal([
        'circle',
        'square',
        'cross',
        'diamond',
        'triangle-up',
        'triangle-down'
      ]);
    });

  });

  describe('getHandleStreams static method', function() {
    var getHandleStreams;

    beforeEach(function() {
      getHandleStreams = Symbol.getHandleStreams;
    });

    it('is a function', function() {
      expect(getHandleStreams).to.be.a('function');
    });

    it('returns a stream signal definitions dictionary object', function() {
      var result = getHandleStreams({
        _id: 2501,
        type: 'symbol'
      });
      expect(result).to.be.an('object');
    });

    it('keys the stream signal definitions dictionary object by signal name', function() {
      var result = getHandleStreams({
        _id: 2501,
        type: 'symbol'
      });
      expect(Object.keys(result).sort()).to.deep.equal([
        'lyra_symbol_2501_size',
        'lyra_symbol_2501_x',
        'lyra_symbol_2501_y'
      ]);
    });

    it('sets each value to an array of signal objects', function() {
      var result = getHandleStreams({
        _id: 2501,
        type: 'symbol'
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
