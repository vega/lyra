/* eslint no-unused-expressions:0 */
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
        }
      }
    });
  });

  describe('getIn', function() {
    var getIn;

    beforeEach(function() {
      getIn = immutableUtils.getIn;
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

    it('sets a nested value in an Immutable structure', function() {
      var result = setIn(map, 'some.deep.nested.structure', 'of another sort');
      expect(result.toJS()).to.deep.equal({
        some: {
          deep: {
            nested: {
              structure: 'of another sort'
            }
          }
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
          }
        }
      });
    });

  });

});
