/* eslint no-unused-expressions:0 */
'use strict';

var expect = require('chai').expect;

var Scene = require('./Scene');
var Group = require('./Group');
var Mark = require('./Mark');
var VLSingle = require('../../rules/VLSingle');

describe('Scene Mark', function() {
  var scene;

  describe('defaultProperties static method', function() {

    it('is a function', function() {
      expect(Scene).to.have.property('defaultProperties');
      expect(Scene.defaultProperties).to.be.a('function');
    });

    it('returns the expected default properties object', function() {
      var result = Scene.defaultProperties();
      expect(result).to.deep.equal({
        type: 'group',
        properties: {
          update: {}
        },
        width: 610,
        height: 610,
        padding: 'auto',
        background: 'white',
        scales: [],
        legends: [],
        axes: [],
        marks: []
      });
    });

    it('merged any provided options into the returned properties object', function() {
      var result = Scene.defaultProperties({
        _parent: 15
      });
      expect(result).to.have.property('_parent');
      expect(result._parent).to.equal(15);
    });

    it('overwrites default properties with those in the provided props object', function() {
      var result = Scene.defaultProperties({
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
      scene = new Scene();
    });

    it('is a constructor function', function() {
      expect(Scene).to.be.a('function');
    });

    it('may be used to create scene instances', function() {
      expect(scene).to.be.an.instanceOf(Scene);
    });

    it('inherits from Group', function() {
      expect(scene).to.be.an.instanceOf(Group);
    });

    it('inherits from Mark', function() {
      expect(scene).to.be.an.instanceOf(Mark);
    });

    it('initializes instance with default presentational properties', function() {
      expect(scene).to.have.property('width');
      expect(scene.width).to.equal(610);
      expect(scene).to.have.property('height');
      expect(scene.height).to.equal(610);
      expect(scene).to.have.property('padding');
      expect(scene.padding).to.equal('auto');
      expect(scene).to.have.property('background');
      expect(scene.background).to.equal('white');
    });

    it('initializes instance with a scales array', function() {
      expect(scene).to.have.property('scales');
      expect(scene.scales).to.deep.equal([]);
    });

    it('initializes instance with a legends array', function() {
      expect(scene).to.have.property('legends');
      expect(scene.legends).to.deep.equal([]);
    });

    it('initializes instance with a axes array', function() {
      expect(scene).to.have.property('axes');
      expect(scene.axes).to.deep.equal([]);
    });

    it('initializes instance with a marks array', function() {
      expect(scene).to.have.property('marks');
      expect(scene.marks).to.deep.equal([]);
    });

    it('initializes instance with an appropriate .name property', function() {
      expect(scene).to.have.property('name');
      expect(scene.name).to.be.a('string');
      expect(scene.name.startsWith('group_')).to.be.true;
    });

    it('initializes instance with a numeric _id', function() {
      expect(scene).to.have.property('_id');
      expect(scene._id).to.be.a('number');
    });

    it('does not initialize instance with a .from property', function() {
      expect(scene.from).to.be.undefined;
    });

    it('initializes instance with a ._rule object', function() {
      expect(scene).to.have.property('_rule');
      expect(scene._rule).to.be.an('object');
      expect(scene._rule).to.be.an.instanceOf(VLSingle);
    });

  });

  describe('constructor with non-default properties', function() {

    beforeEach(function() {
      scene = new Scene({
        _id: 2501,
        name: 'Rome',
        background: 'red',
        padding: 'ridiculous',
        scales: [72, 91],
        legends: [],
        axes: [361],
        marks: [1, 2, 3, 5, 8, 13, 21, 34]
      });
    });

    it('initializes instance with the name from the provided props object', function() {
      expect(scene).to.have.property('name');
      expect(scene.name).to.be.a('string');
      expect(scene.name).to.equal('Rome');
    });

    it('initializes instance with the _id from the provided props object', function() {
      expect(scene).to.have.property('_id');
      expect(scene._id).to.be.a('number');
      expect(scene._id).to.equal(2501);
    });

    it('initializes instance with other keys and values from the provided props object', function() {
      expect(scene).to.have.property('background');
      expect(scene.background).to.equal('red');
      expect(scene).to.have.property('padding');
      expect(scene.padding).to.equal('ridiculous');
    });

    it('initializes instance with the child collections from the provided properties', function() {
      expect(scene.scales).to.deep.equal([72, 91]);
      expect(scene.legends).to.deep.equal([]);
      expect(scene.axes).to.deep.equal([361]);
      expect(scene.marks).to.deep.equal([1, 2, 3, 5, 8, 13, 21, 34]);
    });

    it('still initializes instance with a ._rule object', function() {
      expect(scene).to.have.property('_rule');
      expect(scene._rule).to.be.an('object');
      expect(scene._rule).to.be.an.instanceOf(VLSingle);
    });

  });

  describe('child method', function() {

    beforeEach(function() {
      scene = new Scene();
    });

    it('is a function', function() {
      expect(scene).to.have.property('child');
      expect(scene.child).to.be.a('function');
    });

    it('creates and returns child primitives within the scene', function() {
      [
        'axes',
        'legends',
        'marks.group',
        'marks.rect',
        'marks.symbol'
      ].forEach(function(primitiveType) {
        var child = scene.child(primitiveType);
        expect(child).to.be.an('object');
        expect(child.parent()).to.equal(scene);
      });
    });

    it('creates a scale but does not assign itself as parent', function() {
      var scale = scene.child('scales');
      expect(scale.parent).to.be.null;
    });

    it('throws an error if provided an invalid type', function() {
      expect(function() {
        scene.child('unsupported primitive');
      }).to.throw;
    });

    it('can insert a pre-existing primitive into a scene', function() {
      var otherGroup = new Group();
      expect(otherGroup.parent()).not.to.equal(scene);
      scene.child('marks.scene', otherGroup);
      expect(otherGroup.parent()).to.equal(scene);
    });

  });

});
