/* eslint no-unused-expressions:0 */
'use strict';
var expect = require('chai').expect;

// var Group = require('../ctrl/primitives/marks/Group');
// var Rect = require('../ctrl/primitives/marks/Rect');
var ctrl = require('../ctrl');

var hierarchy = require('./hierarchy');

describe.skip('hierarchy utilities', function() {

  describe('getParent', function() {
    var getParent;

    beforeEach(function() {
      getParent = hierarchy.getParent;
    });

    it('is a function', function() {
      expect(getParent).to.be.a('function');
    });

    it('returns the parent of a provided mark', function() {
      var parent = new Group();
      // Set up a parent hierarchy to test
      parent._id = 1;
      ctrl.primitive(parent._id, parent);
      var rect = new Rect();
      rect._parent = parent._id;
      parent.marks.push(rect._id);
      expect(getParent(rect)).to.equal(parent);
    });

    it('returns null if a mark was not found', function() {
      var parentlessMark = new Rect(),
          result = getParent(parentlessMark);
      expect(result).to.be.null;
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
      var result = getParents({});
      expect(result).to.be.an('array');
      expect(result).to.deep.equal([]);
    });

    it('returns an empty array when called with a mark without a parent', function() {
      var rect = new Rect();
      var result = getParents(rect);
      expect(result).to.be.an('array');
      expect(result).to.deep.equal([]);
    });

    it('returns an array of parent nodes', function() {
      var g1 = new Group(),
          g2 = new Group(),
          g3 = new Group(),
          rect = new Rect(),
          result;
      // Set up a parent hierarchy to test
      [g1, g2, g3, rect].reduce(function(parentMark, childMark, idx) {
        // Set up the child mark
        childMark._id = idx + 1;
        ctrl.primitive(childMark._id, childMark);
        // Set this mark a child of the last;
        if (parentMark) {
          childMark._parent = parentMark._id;
          parentMark.marks.push(childMark._id);
        }
        // then child is the new parent
        return childMark;
      }, null);

      result = getParents(rect);
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
      var g1 = new Group(),
          g2 = new Group(),
          g3 = new Group(),
          r1 = new Rect(),
          r2 = new Rect(),
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
      var g1 = new Group(),
          g2 = new Group(),
          g3 = new Group(),
          rect = new Rect(),
          result;
      // Set up a parent hierarchy to test
      [g1, g2, g3, rect].reduce(function(parentMark, childMark, idx) {
        // Set up the child mark
        childMark._id = idx + 1;
        ctrl.primitive(childMark._id, childMark);
        // Set this mark a child of the last;
        if (parentMark) {
          childMark._parent = parentMark._id;
          parentMark.marks.push(childMark._id);
        }
        // then child is the new parent
        return childMark;
      }, null);

      result = getParentGroupIds(rect);
      expect(result).to.be.an('array');
      expect(result).to.deep.equal([3, 2, 1]);
    });

  });

  describe('getClosestGroupId', function() {
    var getClosestGroupId, store;

    beforeEach(function() {
      getClosestGroupId = storeUtils.getClosestGroupId;
      store = Immutable.fromJS({
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
      var result = getClosestGroupId(store, 600);
      expect(result).to.equal(1);
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

  describe('findInItemTree', function() {
    // These tests require mocking or building a vega scene graph, so their
    // implementation has been deferred given time constraints

    it('returns null if no mark was found');
    it('returns the vega object for the mark matching the provided path');

  });

});
