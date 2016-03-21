'use strict';

var expect = require('chai').expect;
var exporter = require('./exporter');

// Pull in a fresh signals module so we can clean-initialize values used in tests
delete require.cache[require.resolve('../model/signals')];
var sg = require('../model/signals');

var Area = require('../model/primitives/marks/Area');
var Group = require('../model/primitives/marks/Group');
var Guide = require('../model/primitives/Guide');
var Line = require('../model/primitives/marks/Line');
var Mark = require('../model/primitives/marks/Mark');
var Primitive = require('../model/primitives/Primitive');
var Rect = require('../model/primitives/marks/Rect');
var Scale = require('../model/primitives/Scale');
var Scene = require('../model/primitives/marks/Scene');
var Symbol = require('../model/primitives/marks/Symbol');
var Text = require('../model/primitives/marks/Text');

describe('exporter utility', function() {

  before(function() {
    sg.init('vis_width', 500);
    sg.init('vis_height', 500);
  });

  [
    {Ctor: Area, name: 'area'},
    {Ctor: Group, name: 'group'},
    {Ctor: Guide, name: 'guide'},
    {Ctor: Line, name: 'line'},
    {Ctor: Mark, name: 'mark'},
    {Ctor: Primitive, name: 'primitive'},
    {Ctor: Rect, name: 'rect'},
    {Ctor: Scale, name: 'scale'},
    {Ctor: Scene, name: 'scene'},
    {Ctor: Symbol, name: 'symbol'},
    {Ctor: Text, name: 'text'}
  ].forEach(function(primitive) {
    var name = primitive.name;
    var upperName = name[0].toUpperCase() + name.slice(1);
    var Ctor = primitive.Ctor;

    describe(upperName + ' exporter', function() {
      var exporterFn, instance;

      beforeEach(function() {
        exporterFn = exporter[name];
        instance = new Ctor();
      });

      it('is a function', function() {
        expect(exporterFn).to.be.a('function');
      });

      it('returns an object', function() {
        var result = exporterFn(instance);
        expect(result).to.be.an('object');
      });

      // Compatibility test
      it('returns an object equivalent to ' + upperName + '.export()', function() {
        var utilityFnExportResult = exporterFn(instance);
        var prototypeExportResult = instance.export();
        expect(utilityFnExportResult).not.to.equal(prototypeExportResult);
        expect(utilityFnExportResult).to.deep.equal(prototypeExportResult);
      });

      // Compatibility test
      it('returns an object equivalent to ' + upperName + '.export(true)', function() {
        var utilityFnExportResult = exporterFn(instance, true);
        var prototypeExportResult = instance.export(true);
        expect(utilityFnExportResult).not.to.equal(prototypeExportResult);
        expect(utilityFnExportResult).to.deep.equal(prototypeExportResult);
      });

    });
  });

  describe('for nested groups', function() {
    var group1, group2;

    beforeEach(function() {
      group1 = new Group();
      group1.child('marks.rect');
      group2 = group1.child('marks.group');
      group2.child('marks.rect');
      group2.child('scales');
    });

    it('is equivalent to Group.prototype.export(true)', function() {
      var utilityFnExportResult = exporter.group(group1, true);
      var prototypeExportResult = group1.export(true);
      expect(utilityFnExportResult).not.to.equal(prototypeExportResult);
      expect(utilityFnExportResult).to.deep.equal(prototypeExportResult);
      console.log(utilityFnExportResult);
    });

    it('exports a well-formed result', function() {
      var result = exporter.group(group1, true);
      expect(result).to.be.an('object');
      expect(result).to.have.property('type');
      expect(result.type).to.equal('group');

      expect(result).to.have.property('marks');
      expect(result.marks).to.be.an('array');
      expect(result.marks.length).to.equal(2);

      var child1 = result.marks[0];
      expect(child1).to.be.an('object');
      expect(child1).to.have.property('type');
      expect(child1.type).to.equal('rect');

      var child2 = result.marks[1];
      expect(child2).to.be.an('object');
      expect(child2).to.have.property('type');
      expect(child2.type).to.equal('group');

      expect(child2).to.have.property('marks');
      expect(child2.marks).to.be.an('array');
      expect(child2.marks.length).to.equal(1);
      expect(child2.marks[0]).to.have.property('type');
      expect(child2.marks[0].type).to.equal('rect');

      expect(child2).to.have.property('scales');
      expect(child2.scales).to.be.an('array');
      expect(child2.scales.length).to.equal(1);
    });

  });

});
