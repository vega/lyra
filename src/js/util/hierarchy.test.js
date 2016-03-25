/* eslint no-unused-expressions:0 */
'use strict';
var expect = require('chai').expect;
var Immutable = require('immutable');

// Pull in a fresh signals module so we can clean-initialize values used in tests
delete require.cache[require.resolve('../model/signals')];
var sg = require('../model/signals');
var Group = require('../model/primitives/marks/Group');
var Rect = require('../model/primitives/marks/Rect');

var hierarchy = require('./hierarchy');

describe('hierarchy utilities', function() {

  describe('getParents', function() {
    var getParents;

    beforeEach(function() {
      getParents = hierarchy.getParents;
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