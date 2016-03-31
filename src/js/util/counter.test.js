/* eslint no-unused-expressions:0 */
'use strict';
var expect = require('chai').expect;

describe('counter utility', function() {
  var counter;

  beforeEach(function() {
    // Pull in a fresh module so that its internal counter caches are reset
    +delete require.cache[require.resolve('./counter')];
    counter = require('./counter');
  });

  describe('.global() counter', function() {

    it('is a function', function() {
      expect(counter).to.have.property('global');
      expect(counter.global).to.be.a('function');
    });

    it('starts at 1', function() {
      var next = counter.global();
      expect(next).to.equal(1);
    });

    it('counts up by 1 on each subsequent call', function() {
      var results = [];
      for (var i = 0; i < 10; i++) {
        results.push(counter.global());
      }
      expect(results).to.deep.equal([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

  });

  describe('.type() counter', function() {

    it('is a function', function() {
      expect(counter).to.have.property('type');
      expect(counter.type).to.be.a('function');
    });

    it('returns undefined if no type is provided', function() {
      var next = counter.type();
      expect(next).not.to.be.defined;
    });

    it('starts groups at 0', function() {
      var next = counter.type('group');
      expect(next).to.equal(0);
    });

    it('counts up by 1 on each subsequent call for groups', function() {
      var results = [];
      for (var i = 0; i < 10; i++) {
        results.push(counter.type('group'));
      }
      expect(results).to.deep.equal([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('starts other marks at 1', function() {
      var next = counter.type('rect');
      expect(next).to.equal(1);
    });

    it('counts up by 1 on each subsequent call for a given type', function() {
      var groupResults = [];
      var rectResults = [];
      var scaleResults = [];
      for (var i = 0; i < 10; i++) {
        groupResults.push(counter.type('group'));
      }
      for (var i = 0; i < 5; i++) {
        rectResults.push(counter.type('rect'));
      }
      for (var i = 0; i < 7; i++) {
        scaleResults.push(counter.type('scale'));
      }
      expect(groupResults).to.deep.equal([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
      expect(counter.type('group')).to.equal(10);

      expect(rectResults).to.deep.equal([1, 2, 3, 4, 5]);
      expect(counter.type('rect')).to.equal(6);

      expect(scaleResults).to.deep.equal([1, 2, 3, 4, 5, 6, 7]);
      expect(counter.type('scale')).to.equal(8);
    });

  });

});
