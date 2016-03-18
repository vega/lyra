/* eslint no-unused-expressions:0 */
'use strict';

var expect = require('chai').expect;

// Pull in a fresh signals module so we can clean-initialize values used in tests
delete require.cache[require.resolve('../../../model/signals')];
var sg = require('../../../model/signals');

var Group = require('./Group');
var Mark = require('./Mark');

describe('Group Mark', function() {
  var group;

  beforeEach(function() {
    group = new Group();
  });

  describe('constructor', function() {

    it('is a constructor function', function() {
      expect(Group).to.be.a('function');
    });

    it('may be used to create group instances', function() {
      expect(group).to.be.an.instanceOf(Group);
    });

    it('inherits from Mark', function() {
      expect(group).to.be.an.instanceOf(Mark);
    });

  });

  describe('default properties', function() {

    it('contains a properties object', function() {
      expect(group).to.have.property('properties');
    });

    it('is initialized with a scales array', function() {
      expect(group).to.have.property('scales');
      expect(group.scales).to.deep.equal([]);
    });

    it('is initialized with a legends array', function() {
      expect(group).to.have.property('legends');
      expect(group.legends).to.deep.equal([]);
    });

    it('is initialized with a axes array', function() {
      expect(group).to.have.property('axes');
      expect(group.axes).to.deep.equal([]);
    });

    it('is initialized with a marks array', function() {
      expect(group).to.have.property('marks');
      expect(group.marks).to.deep.equal([]);
    });

  });

  describe('child method', function() {

    it('is a function', function() {
      expect(group).to.have.property('child');
      expect(group.child).to.be.a('function');
    });

    it('creates and returns child primitives within the group', function() {
      [
        'axes',
        'legends',
        'marks.group',
        'marks.rect',
        'marks.symbol'
      ].forEach(function(primitiveType) {
        var child = group.child(primitiveType);
        expect(child).to.be.an('object');
        expect(child.parent()).to.equal(group);
      });
    });

    it('creates a scale but does not assign itself as parent', function() {
      var scale = group.child('scales');
      expect(scale.parent).to.be.null;
    });

    it('throws an error if provided an invalid type', function() {
      expect(function() {
        group.child('unsupported primitive');
      }).to.throw;
    });

    it('can insert a pre-existing primitive into a group', function() {
      var otherGroup = new Group();
      expect(otherGroup.parent()).not.to.equal(group);
      group.child('marks.group', otherGroup);
      expect(otherGroup.parent()).to.equal(group);
    });

  });

  describe('export method', function() {

    it('is a function', function() {
      expect(group).to.have.property('export');
      expect(group.export).to.be.a('function');
    });

    it('renders the group to a vega spec object', function() {
      // Group initializes with signals for width and height that depend on the
      // overall visualization's dimensions having been set
      sg.init('vis_width', 500);
      sg.init('vis_height', 500);
      var result = group.export();
      expect(result).to.be.an('object');
    });

  });

});
