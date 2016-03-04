/* eslint no-unused-expressions:0 */
'use strict';
var expect = require('chai').expect;
var assert = require('chai').assert;
var map = require('./map-manipulator');

describe('Map Manipulator utility', function() {
  it('it returns a function', function() {
    var mapped = map('x', 'span');
    expect(mapped).to.be.a('function');
  });

  it('it returns an object with key & manipulator keys when return called as a function', function() {
    var mapped = map('x', 'arrow')({x: 100, y: 200});
    var mock = {
      x: 100,
      y: 200,
      key: 'x',
      manipulator: 'arrow'
    };
    assert.deepEqual(mapped, mock);
  });

});
