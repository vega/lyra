/* eslint no-unused-expressions:0, new-cap:0 */
'use strict';
var expect = require('chai').expect,
    Immutable = require('immutable'),
    Mark = require('../store/factory/Mark'),
    hierarchy = require('./hierarchy'),
    getInVis = require('./immutable-utils').getInVis;

describe('hierarchy utilities', function() {
  function store(prims) {
    return Immutable.Map({
      vis: {
        present: Immutable.fromJS(prims)
      }
    });
  }

  describe('getParent', function() {
    var getParent, state, rect, parent;

    beforeEach(function() {
      getParent = hierarchy.getParent;
      state = store({
        marks: {
          '1': Mark('group'),
          '2': Mark('rect', {_parent: 1})
        }
      });

      parent = getInVis(state, 'marks.1');
      rect = getInVis(state, 'marks.2');
    });

    it('is a function', function() {
      expect(getParent).to.be.a('function');
    });

    it('returns the parent of a provided mark', function() {
      expect(getParent(rect, state)).to.equal(parent);
    });

    it('returns null if a mark was not found', function() {
      var parentlessMark  = Immutable.Map(),
          parentlessMark2 = Immutable.Map({_parent: 5});
      expect(getParent(parentlessMark, state)).to.be.null;
      expect(getParent(parentlessMark2, state)).to.be.null;
    });

  });

  describe('getParents', function() {
    var getParents;

    beforeEach(function() {
      getParents = hierarchy.getParents;
    });

    it('is a function', function() {
      expect(getParents).to.be.a('function');
    });

    it('returns an empty array when called with no arguments', function() {
      var result = getParents();
      expect(result).to.be.an('array');
      expect(result).to.deep.equal([]);
    });

    it('returns an empty array when called with an object without a parent property', function() {
      var result = getParents(Immutable.Map());
      expect(result).to.be.an('array');
      expect(result).to.deep.equal([]);
    });

    it('returns an empty array when called with a mark without a parent', function() {
      var result = getParents(Immutable.Map({_parent: 5}));
      expect(result).to.be.an('array');
      expect(result).to.deep.equal([]);
    });

    it('returns an array of parent nodes', function() {
      var state = store({
        marks: {
          '1': Mark('group'),
          '2': Mark('group', {_parent: 1}),
          '3': Mark('group', {_parent: 2}),
          '4': Mark('rect', {_parent: 3})
        }
      });

      var g1 = getInVis(state, 'marks.1'),
          g2 = getInVis(state, 'marks.2'),
          g3 = getInVis(state, 'marks.3'),
          rect = getInVis(state, 'marks.4');

      var result = getParents(rect, state);
      expect(result).to.be.an('array');
      expect(result).to.deep.equal([g3, g2, g1]);
    });

  });

  describe('getGroupIds', function() {
    var getGroupIds;

    beforeEach(function() {
      getGroupIds = hierarchy.getGroupIds;
    });

    it('is a function', function() {
      expect(getGroupIds).to.be.a('function');
    });

    it('returns an array', function() {
      expect(getGroupIds([])).to.be.an('array');
    });

    it('returns the IDs for any list items that are groups', function() {
      var g1 = Immutable.fromJS(Mark('group')),
          g2 = Immutable.fromJS(Mark('group')),
          g3 = Immutable.fromJS(Mark('group')),
          r1 = Immutable.fromJS(Mark('rect')),
          r2 = Immutable.fromJS(Mark('rect')),
          result = getGroupIds([g1, g2, r1, g3, r2]);
      expect(result).to.deep.equal([g1._id, g2._id, g3._id]);
    });

  });

  describe('getParentGroupIds', function() {
    var getParentGroupIds;

    beforeEach(function() {
      getParentGroupIds = hierarchy.getParentGroupIds;
    });

    it('is a function', function() {
      expect(getParentGroupIds).to.be.a('function');
    });

    it('returns an array when called with no arguments', function() {
      var result = getParentGroupIds();
      expect(result).to.be.an('array');
      expect(result).to.deep.equal([]);
    });

    it('returns the parent group IDs for a mark in reverse-hierarchical order', function() {
      var state = store({
        marks: {
          '1': Mark('group', {_id: 1}),
          '2': Mark('group', {_id: 2, _parent: 1}),
          '3': Mark('group', {_id: 3, _parent: 2}),
          '4': Mark('rect', {_id: 4, _parent: 3})
        }
      });

      var result = getParentGroupIds(4, state);
      expect(result).to.be.an('array');
      expect(result).to.deep.equal([3, 2, 1]);
    });

  });

  describe('getClosestGroupId', function() {
    var getClosestGroupId, state;

    beforeEach(function() {
      getClosestGroupId = hierarchy.getClosestGroupId;
      state = store({
        scene: {
          id: 1
        },
        marks: {
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

    it('returns scene id if an invalid ID is specified', function() {
      var result = getClosestGroupId(600, state);
      expect(result).to.equal(1);
    });

    it('returns the same ID if the provided ID represents a scene', function() {
      var result = getClosestGroupId(1, state);
      expect(result).to.equal(1);
    });

    it('returns the same ID if the provided ID represents a group', function() {
      var result = getClosestGroupId(2, state);
      expect(result).to.equal(2);
    });

    it('returns the mark\'s parent ID if the provided ID is not a group or scene', function() {
      var result = getClosestGroupId(3, state);
      expect(result).to.equal(2);
    });

    it('walks up as many levels as needed to find a group or scene id', function() {
      var result = getClosestGroupId(4, state);
      expect(result).to.equal(2);
    });

    it('returns the scene ID if the provided mark is a child of the scene itself', function() {
      var result = getClosestGroupId(5, state);
      expect(result).to.equal(1);
    });

  });

  describe('findInItemTree', function() {
    // These tests require mocking or building a vega scene graph, so their
    // implementation has been deferred given time constraints

    it('returns null if no mark was found');
    it('returns the vega object for the mark matching the provided path');

  });

});
