/* eslint no-unused-expressions:0 */
'use strict';
var expect = require('chai').expect;

var Line = require('./Line');
var Mark = require('./Mark');
var VLSingle = require('../../rules/VLSingle');

describe('Line Mark Primitive', function() {
  var line;

  describe('defaultProperties static method', function() {

    it('is a function', function() {
      expect(Line).to.have.property('defaultProperties');
      expect(Line.defaultProperties).to.be.a('function');
    });

    it('returns the expected default properties object', function() {
      var result = Line.defaultProperties();
      expect(result).to.deep.equal({
        type: 'line',
        properties: {
          update: {
            x: {value: 25},
            y: {value: 25},
            stroke: {value: '#000000'},
            strokeWidth: {value: 3},
            tension: {value: 13},
            interpolate: {value: 'monotone'}
          }
        }
      });
    });

    it('merged any provided options into the returned properties object', function() {
      var result = Line.defaultProperties({
        _parent: 15
      });
      expect(result).to.have.property('_parent');
      expect(result._parent).to.equal(15);
    });

    it('overwrites default properties with those in the provided props object', function() {
      var result = Line.defaultProperties({
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
      line = new Line();
    });

    it('is a constructor function', function() {
      expect(Line).to.be.a('function');
    });

    it('may be used to create line instances', function() {
      expect(line).to.be.an.instanceOf(Line);
    });

    it('inherits from Mark', function() {
      expect(line).to.be.an.instanceOf(Mark);
    });

    it('initializes instance with a .type property of "line"', function() {
      expect(line).to.have.property('type');
      expect(line.type).to.be.a('string');
      expect(line.type).to.equal('line');
    });

    it('initializes instance with an appropriate .name property', function() {
      expect(line).to.have.property('name');
      expect(line.name).to.be.a('string');
      expect(line.name.startsWith('line_')).to.be.true;
    });

    it('initializes instance with default vega properties', function() {
      expect(line).to.have.property('properties');
      expect(line.properties).to.be.an('object');
      expect(line.properties).to.deep.equal({
        update: {
          x: {value: 25},
          y: {value: 25},
          stroke: {value: '#000000'},
          strokeWidth: {value: 3},
          tension: {value: 13},
          interpolate: {value: 'monotone'}
        }
      });
    });

    it('does not initialize instance with a numeric _id by default', function() {
      expect(line).not.to.have.property('_id');
    });

    it('does not initialize instance with a .from property', function() {
      expect(line.from).to.be.undefined;
    });

    it('initializes instance with a ._rule object', function() {
      expect(line).to.have.property('_rule');
      expect(line._rule).to.be.an('object');
      expect(line._rule).to.be.an.instanceOf(VLSingle);
    });

  });

  describe('constructor with non-default properties', function() {

    beforeEach(function() {
      line = new Line({
        type: 'line',
        _id: 2501,
        name: 'Spartacus',
        properties: {
          update: {
            stroke: '#010101'
          }
        }
      });
    });

    it('initializes instance with the name from the provided props object', function() {
      expect(line).to.have.property('name');
      expect(line.name).to.be.a('string');
      expect(line.name).to.equal('Spartacus');
    });

    it('initializes instance with the _id from the provided props object', function() {
      expect(line).to.have.property('_id');
      expect(line._id).to.be.a('number');
      expect(line._id).to.equal(2501);
    });

    it('initializes instance with the .properties from the provided props object', function() {
      expect(line).to.have.property('properties');
      expect(line.properties).to.deep.equal({
        update: {
          stroke: '#010101'
        }
      });
    });

    it('still initializes instance with a ._rule object', function() {
      expect(line).to.have.property('_rule');
      expect(line._rule).to.be.an('object');
      expect(line._rule).to.be.an.instanceOf(VLSingle);
    });

  });

  describe('export method', function() {

    it('lines initialized w/ dummy data', function() {
      var exported = line.export(false);
      expect(exported).to.have.property('from');
      expect(exported.from).to.deep.equal({data: 'dummy_data_line'});
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

  describe('getHandleStreams static method', function() {
    var getHandleStreams;

    beforeEach(function() {
      getHandleStreams = Line.getHandleStreams;
    });

    it('is a function', function() {
      expect(getHandleStreams).to.be.a('function');
    });

    it('returns a stream signal definitions dictionary object', function() {
      var result = getHandleStreams({
        _id: 2501,
        type: 'text'
      });
      expect(result).to.be.an('object');
    });

    it('keys the stream signal definitions dictionary object by signal name', function() {
      var result = getHandleStreams({
        _id: 2501,
        type: 'line'
      });
      expect(Object.keys(result).sort()).to.deep.equal([
        'lyra_line_2501_x',
        'lyra_line_2501_y'
      ]);
    });

    it('sets each value to an array of signal objects', function() {
      var result = getHandleStreams({
        _id: 2501,
        type: 'line'
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
