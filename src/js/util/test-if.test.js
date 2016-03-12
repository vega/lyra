/* eslint no-unused-expressions:0 */
'use strict';
var expect = require('chai').expect;
var test = require('./test-if');

describe('test-if vega expression utility', function() {

  it('is a function', function() {
    expect(test).to.be.a('function');
  });

  it('returns a vega if-expression string utilizing the provided arguments', function() {
    var result = test('[predicate]', '[true condition]', '[false condition]');
    expect(result).to.be.a('string');
    expect(result).to.equal('if([predicate],[true condition],[false condition])');
  });

});
