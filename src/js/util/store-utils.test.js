/* eslint no-unused-expressions:0 */
'use strict';
var expect = require('chai').expect;
var storeUtils = require('./store-utils');

var Immutable = require('immutable');

describe('store utilities', function() {

  it('is an object', function() {
    expect(storeUtils).to.be.an('object');
  });

  describe('getClosestGroupId', function() {
    var getClosestGroupId, store;

    beforeEach(function() {
      getClosestGroupId = storeUtils.getClosestGroupId;
      store = Immutable.fromJS({
        primitives: {
          '1': {_id: 1, type: 'scene'},
          '2': {_id: 2, _parent: 1, type: 'group'},
          '3': {_id: 3, _parent: 2, type: 'haschildrensomehowbutisnotagroup'},
          '4': {_id: 4, _parent: 3, type: 'symbol'},
          '5': {_id: 5, _parent: 1, type: 'symbol'}
        }
      });
    });

    it('is a function', function() {
      expect(getClosestGroupId).to.be.a('function');
    });

    it('returns null if an invalid ID is specified', function() {
      var result = getClosestGroupId(store, 600);
      expect(result).to.equal(null);
    });

    it('returns the same ID if the provided ID represents a scene', function() {
      var result = getClosestGroupId(store, 1);
      expect(result).to.equal(1);
    });

    it('returns the same ID if the provided ID represents a group', function() {
      var result = getClosestGroupId(store, 2);
      expect(result).to.equal(2);
    });

    it('returns the mark\'s parent ID if the provided ID is not a group or scene', function() {
      var result = getClosestGroupId(store, 3);
      expect(result).to.equal(2);
    });

    it('walks up as many levels as needed to find a group or scene id', function() {
      var result = getClosestGroupId(store, 4);
      expect(result).to.equal(2);
    });

    it('returns the scene ID if the provided mark is a child of the scene itself', function() {
      var result = getClosestGroupId(store, 5);
      expect(result).to.equal(1);
    });

  });

});
