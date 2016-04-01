/* eslint no-unused-expressions:0 */
'use strict';

var expect = require('chai').expect;

var Group = require('./Group');
var Mark = require('./Mark');
var ns = require('../../../util/ns');
var VLSingle = require('../../rules/VLSingle');

describe('Group Mark', function() {
  var group;

  describe('defaultProperties static method', function() {

    it('is a function', function() {
      expect(Group).to.have.property('defaultProperties');
      expect(Group.defaultProperties).to.be.a('function');
    });

    it('returns the expected default properties object', function() {
      var result = Group.defaultProperties();
      expect(result).to.deep.equal({
        type: 'group',
        properties: {
          update: {
            fillOpacity: {value: 1},
            stroke: {value: '#000000'},
            strokeWidth: {value: 0.25},
            x: {value: 0},
            y: {value: 0},
            width: {signal: ns('vis_width')},
            height: {signal: ns('vis_height')},
            fill: {value: 'transparent'}
          }
        },
        scales: [],
        legends: [],
        axes: [],
        marks: []
      });
    });

  });

  describe('constructor', function() {

    beforeEach(function() {
      group = new Group();
    });

    it('is a constructor function', function() {
      expect(Group).to.be.a('function');
    });

    it('may be used to create group instances', function() {
      expect(group).to.be.an.instanceOf(Group);
    });

    it('inherits from Mark', function() {
      expect(group).to.be.an.instanceOf(Mark);
    });

    it('initializes instance with default vega properties', function() {
      var defaults = Group.defaultProperties().properties;
      expect(group).to.have.property('properties');
      expect(group.properties).to.be.an('object');
      expect(group.properties).to.deep.equal(defaults);
    });

    it('initializes instance with a scales array', function() {
      expect(group).to.have.property('scales');
      expect(group.scales).to.deep.equal([]);
    });

    it('initializes instance with a legends array', function() {
      expect(group).to.have.property('legends');
      expect(group.legends).to.deep.equal([]);
    });

    it('initializes instance with a axes array', function() {
      expect(group).to.have.property('axes');
      expect(group.axes).to.deep.equal([]);
    });

    it('initializes instance with a marks array', function() {
      expect(group).to.have.property('marks');
      expect(group.marks).to.deep.equal([]);
    });

    it('initializes instance with a .type property of "group"', function() {
      expect(group).to.have.property('type');
      expect(group.type).to.be.a('string');
      expect(group.type).to.equal('group');
    });

    it('initializes instance with an appropriate .name property', function() {
      expect(group).to.have.property('name');
      expect(group.name).to.be.a('string');
      expect(group.name.startsWith('group_')).to.be.true;
    });

    it('initializes instance with a numeric _id', function() {
      expect(group).to.have.property('_id');
      expect(group._id).to.be.a('number');
    });

    it('does not initialize instance with a .from property', function() {
      expect(group.from).to.be.undefined;
    });

    it('initializes instance with a ._rule object', function() {
      expect(group).to.have.property('_rule');
      expect(group._rule).to.be.an('object');
      expect(group._rule).to.be.an.instanceOf(VLSingle);
    });

  });

  describe('constructor with non-default properties', function() {

    beforeEach(function() {
      group = new Group({
        type: 'group',
        _id: 2501,
        name: 'Spartacus',
        properties: {
          update: {
            fill: '#ff000'
          }
        },
        scales: [72, 91],
        legends: [],
        axes: [361],
        marks: [1, 2, 3, 5, 8, 13, 21, 34]
      });
    });

    it('initializes instance with the name from the provided props object', function() {
      expect(group).to.have.property('name');
      expect(group.name).to.be.a('string');
      expect(group.name).to.equal('Spartacus');
    });

    it('initializes instance with the _id from the provided props object', function() {
      expect(group).to.have.property('_id');
      expect(group._id).to.be.a('number');
      expect(group._id).to.equal(2501);
    });

    it('initializes instance with the .properties from the provided props object', function() {
      expect(group).to.have.property('properties');
      expect(group.properties).to.deep.equal({
        update: {
          fill: '#ff000'
        }
      });
    });

    it('initializes instance with the child collections from the provided properties', function() {
      expect(group.scales).to.deep.equal([72, 91]);
      expect(group.legends).to.deep.equal([]);
      expect(group.axes).to.deep.equal([361]);
      expect(group.marks).to.deep.equal([1, 2, 3, 5, 8, 13, 21, 34]);
    });

    it('still initializes instance with a ._rule object', function() {
      expect(group).to.have.property('_rule');
      expect(group._rule).to.be.an('object');
      expect(group._rule).to.be.an.instanceOf(VLSingle);
    });

  });

  describe('child method', function() {

    beforeEach(function() {
      group = new Group();
    });

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

});
