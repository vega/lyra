'use strict';

var expect = require('chai').expect;
var exporter = require('./exporter');

/*
- [ ] Area
- [ ] Group
- [x] Guide
- [ ] Line
- [x] Mark
- [x] Primitive
- [-] Rect
- [-] Scale
- [-] Scene
- [-] Symbol
- [-] Text
*/

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

// Utility methods borrowed from jQuery 1.12
var hasOwn = ({}).hasOwnProperty;
function isPlainObject(obj) {
  // Not plain objects:
  // - Any object or value whose internal [[Class]] property is not "[object Object]"
  // - DOM nodes
  if (typeof obj !== "object" || obj.nodeType) {
    return false;
  }

  if ( obj.constructor &&
      ! hasOwn.call( obj.constructor.prototype, 'isPrototypeOf' ) ) {
    return false;
  }

  // If the function hasn't returned already, we're confident that
  // |obj| is a plain object, created by {} or constructed with new Object
  return true;
}

describe('exporter utility', function() {

  [
    // { Ctor: Area, name: 'area' },
    // { Ctor: Group, name: 'group' },
    { Ctor: Guide, name: 'guide' },
    // { Ctor: Line, name: 'line' },
    { Ctor: Mark, name: 'mark' },
    { Ctor: Primitive, name: 'primitive' },
    // { Ctor: Rect, name: 'rect' },
    // { Ctor: Scale, name: 'scale' },
    // { Ctor: Scene, name: 'scene' },
    // { Ctor: Symbol, name: 'symbol' },
    // { Ctor: Text, name: 'text' }
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

      it('returns a vanilla object', function() {
        var result = exporterFn(instance);
        expect(result).to.be.an('object');
        expect(isPlainObject(result)).to.equal(true);
      });

      // Compatibility test
      it('returns an object equivalent to ' + upperName + '.export()', function() {
        var utilityFnExportResult = exporterFn(instance);
        var prototypeExportResult = instance.export();
        expect(utilityFnExportResult).not.to.equal(prototypeExportResult);
        expect(utilityFnExportResult).to.deep.equal(prototypeExportResult);
      });

    });
  });

});
