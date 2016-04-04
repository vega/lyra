/* eslint new-cap:0, no-unused-expressions:0 */
'use strict';
var expect = require('chai').expect;
var Immutable = require('immutable');

var immutableUtils = require('./immutable-utils');

describe('immutable utilities', function() {
  var map;

  beforeEach(function() {
    map = Immutable.fromJS({
      some: {
        deep: {
          nested: {
            structure: 'of some sort'
          }
        },
        arrOfNums: [1, 2, 3, 5, 8],
        arrOfStrs: ['kookaburra', 'numbat', 'bobcat', 'photocopier']
      }
    });
  });

  describe('get', function() {
    var get;

    beforeEach(function() {
      get = immutableUtils.get;
    });

    it('is a function', function() {
      expect(get).to.be.a('function');
    });

    it('coerces all keys to strings', function() {
      // Demo store with both numeric and string keys
      map = Immutable.Map().set(1, 'number').set('1', 'string');
      expect(map.get(1)).to.equal('number');
      expect(get(map, 1)).to.equal('string');
      expect(map.get('1')).to.equal('string');
      expect(get(map, '1')).to.equal('string');
    });

  });

  describe('set', function() {
    var set;

    beforeEach(function() {
      set = immutableUtils.set;
    });

    it('is a function', function() {
      expect(set).to.be.a('function');
    });

    it('coerces all keys to strings', function() {
      map = Immutable.Map().set(1, 'number');
      var result = set(map, 1, 'string');
      expect(result.get(1)).to.equal('number');
      expect(result.get('1')).to.equal('string');
    });

  });

  describe('getIn', function() {
    var getIn;

    beforeEach(function() {
      getIn = immutableUtils.getIn;
    });

    it('is a function', function() {
      expect(getIn).to.be.a('function');
    });

    it('returns a nested value from an Immutable structure', function() {
      var result = getIn(map, 'some.deep.nested.structure');
      expect(result).to.equal('of some sort');
    });

  });

  describe('setIn', function() {
    var setIn, Map;

    beforeEach(function() {
      setIn = immutableUtils.setIn;
      Map = Immutable.Map;
    });

    it('is a function', function() {
      expect(setIn).to.be.a('function');
    });

    it('sets a nested value in an Immutable structure', function() {
      var result = setIn(map, 'some.deep.nested.structure', 'of another sort');
      expect(result.toJS()).to.deep.equal({
        some: {
          deep: {
            nested: {
              structure: 'of another sort'
            }
          },
          arrOfNums: [1, 2, 3, 5, 8],
          arrOfStrs: ['kookaburra', 'numbat', 'bobcat', 'photocopier']
        }
      });
    });

    it('creates a new Map hierarchy if a non-existent path is provided', function() {
      var result = setIn(map, 'some.even.more.deeply.nested', 'structure');
      expect(Map.isMap(result.getIn(['some', 'even']))).to.equal(true);
      expect(Map.isMap(result.getIn(['some', 'even', 'more']))).to.equal(true);
      expect(Map.isMap(result.getIn(['some', 'even', 'more', 'deeply']))).to.equal(true);
      expect(result.getIn(['some', 'even', 'more', 'deeply']).get('nested')).to.equal('structure');
      expect(result.toJS()).to.deep.equal({
        some: {
          deep: {
            nested: {
              structure: 'of some sort'
            }
          },
          even: {
            more: {
              deeply: {
                nested: 'structure'
              }
            }
          },
          arrOfNums: [1, 2, 3, 5, 8],
          arrOfStrs: ['kookaburra', 'numbat', 'bobcat', 'photocopier']
        }
      });
    });

  });

  describe('ensureValuePresent', function() {
    var getIn, ensureValuePresent;

    beforeEach(function() {
      getIn = immutableUtils.getIn;
      ensureValuePresent = immutableUtils.ensureValuePresent;
    });

    it('is a function', function() {
      expect(ensureValuePresent).to.be.a('function');
    });

    it('can be used to add a number into an array within a nested Map', function() {
      var result = ensureValuePresent(map, 'some.arrOfNums', 13);
      expect(getIn(result, 'some.arrOfNums').toJS()).to.deep.equal([1, 2, 3, 5, 8, 13]);
    });

    it('will not duplicate a number that is already present', function() {
      var result = ensureValuePresent(map, 'some.arrOfNums', 5);
      expect(getIn(result, 'some.arrOfNums').toJS()).to.deep.equal([1, 2, 3, 5, 8]);
    });

    it('can be used to add a string into an array within a nested Map', function() {
      var result = ensureValuePresent(map, 'some.arrOfStrs', 'stapler');
      expect(getIn(result, 'some.arrOfStrs').toJS()).to.deep.equal([
        'kookaburra', 'numbat', 'bobcat', 'photocopier', 'stapler'
      ]);
    });

    it('will not duplicate a string that is already present', function() {
      var result = ensureValuePresent(map, 'some.arrOfStrs', 'numbat');
      expect(result).to.equal(map);
      expect(getIn(result, 'some.arrOfStrs').toJS()).to.deep.equal([
        'kookaburra', 'numbat', 'bobcat', 'photocopier'
      ]);
    });

  });

  describe('ensureValueAbsent', function() {
    var getIn, ensureValueAbsent;

    beforeEach(function() {
      getIn = immutableUtils.getIn;
      ensureValueAbsent = immutableUtils.ensureValueAbsent;
    });

    it('is a function', function() {
      expect(ensureValueAbsent).to.be.a('function');
    });

    it('can be used to remove a number from an array within a nested Map', function() {
      var result = ensureValueAbsent(map, 'some.arrOfNums', 5);
      expect(getIn(result, 'some.arrOfNums').toJS()).to.deep.equal([1, 2, 3, 8]);
    });

    it('will not mutate the array if the number is not found', function() {
      var result = ensureValueAbsent(map, 'some.arrOfNums', 21);
      expect(result).to.equal(map);
      expect(getIn(result, 'some.arrOfNums').toJS()).to.deep.equal([1, 2, 3, 5, 8]);
    });

    it('can be used to remove a string from an array within a nested Map', function() {
      var result = ensureValueAbsent(map, 'some.arrOfStrs', 'photocopier');
      expect(getIn(result, 'some.arrOfStrs').toJS()).to.deep.equal(['kookaburra', 'numbat', 'bobcat']);
    });

    it('will not mutate the array if the string is not found', function() {
      var result = ensureValueAbsent(map, 'some.arrOfStrs', 'echidna');
      expect(result).to.equal(map);
      expect(getIn(result, 'some.arrOfStrs').toJS()).to.deep.equal(['kookaburra', 'numbat', 'bobcat', 'photocopier']);
    });

  });

});
