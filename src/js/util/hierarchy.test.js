/* eslint no-unused-expressions:0 */
'use strict';
var expect = require('chai').expect;

var Group = require('../model/primitives/marks/Group');
var Rect = require('../model/primitives/marks/Rect');

var hierarchy = require('./hierarchy');

describe('hierarchy utilities', function() {

  describe('getParent', function() {
    var getParent;

    beforeEach(function() {
      getParent = hierarchy.getParent;
    });

    it('is a function', function() {
      expect(getParent).to.be.a('function');
    });

    it('returns the parent of a provided mark', function() {
      var parent = new Group(),
          rect = parent.child('marks.rect'),
          result = getParent(rect);
      expect(result).to.equal(parent);
    });

    it('returns null if a mark was not found', function() {
      var parentlessMark = new Rect(),
          result = getParent(parentlessMark);
      expect(result).to.be.null;
    });

  });

  describe('getChildren', function() {
    var getChildren;

    beforeEach(function() {
      getChildren = hierarchy.getChildren;
    });

    it('is a function', function() {
      expect(getChildren).to.be.a('function');
    });

    it('returns an empty array for childless groups', function() {
      var group = new Group(),
          result = getChildren(group);
      expect(result).to.deep.equal([]);
    });

    it('returns an array of all children of the provided group', function() {
      var group = new Group(),
          child1 = group.child('scales'),
          child2 = group.child('axes'),
          child3 = group.child('marks.group'),
          child4 = group.child('marks.rect'),
          result = getChildren(group);
      expect(result).to.deep.equal([child1, child2, child3, child4]);
    });

    it('omits invalid IDs from the returned array', function() {
      var group = new Group();
      group.marks.push('invalidID1', 'invalidID2');
      var result = getChildren(group);
      expect(result).to.deep.equal([]);
    });

    it('returns an empty array for non-group marks', function() {
      var rect = new Rect(),
          result = getChildren(rect);
      expect(result).to.deep.equal([]);
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
          g2 = g1.child('marks.group'),
          g3 = g2.child('marks.group'),
          rect = g3.child('marks.rect'),
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
          g2 = g1.child('marks.group'),
          g3 = g2.child('marks.group'),
          rect = g3.child('marks.rect'),
          result;

      g1._id = 'foo';
      g2._id = 'bar';
      g3._id = 'baz';

      result = getParentGroupIds(rect);
      expect(result).to.be.an('array');
      expect(result).to.deep.equal(['baz', 'bar', 'foo']);
    });

  });

  describe('findInItemTree', function() {
    // These tests require mocking or building a vega scene graph, so their
    // implementation has been deferred given time constraints

    it('returns null if no mark was found');
    it('returns the vega object for the mark matching the provided path');

  });

});
