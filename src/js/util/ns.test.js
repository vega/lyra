/* eslint no-unused-expressions:0 */
'use strict';
var expect = require('chai').expect;
var ns = require('./ns');

describe('ns (namespace) utility', function() {

  it('is a function', function() {
    expect(ns).to.be.a('function');
  });

  it('returns a string prefixed with "lyra_"', function() {
    var result = ns('str');
    expect(result).to.be.a('string');
    expect(result).to.equal('lyra_str');
  });

  it('does not alter already-prefixed strings', function() {
    var result = ns('lyra_already_namespaced');
    expect(result).to.be.a('string');
    expect(result).to.equal('lyra_already_namespaced');
  });

  it('is idempotent', function() {
    var result = ns(ns(ns(ns('property'))));
    expect(result).to.be.a('string');
    expect(result).to.equal('lyra_property');
  });

});
