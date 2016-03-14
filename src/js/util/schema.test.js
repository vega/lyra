/* eslint no-unused-expressions:0 */
'use strict';
var chai = require('chai');
chai.use(require('sinon-chai'));
var sinon = require('sinon');
var expect = chai.expect;

var vg = require('vega');
var schema = require('./schema');

describe('vega schema utility', function() {
  var mockVegaSchema;

  before(function() {
    // Work around vega's internal XHR request by stubbing vg.schema
    mockVegaSchema = {
      $schema: 'http://json-schema.org/draft-04/schema#',
      title: 'Vega Visualization Specification Language',
      defs: {}
    };
    sinon.stub(vg, 'schema').returns(mockVegaSchema);
  });

  after(function() {
    // Restore original vega schema method
    vg.schema.restore();
  });

  it('is a function', function() {
    expect(schema).to.be.a('function');
  });

  it('downloads the vega JSON schema', function() {
    var result = schema();
    expect(result).to.be.an('object');
    expect(result).to.equal(mockVegaSchema);
    expect(vg.schema).to.have.been.calledOnce;
  });

  it('always returns the same schema object when called', function() {
    var result1 = schema();
    var result2 = schema();
    expect(result1).to.equal(mockVegaSchema);
    expect(result1).to.equal(result2);
  });

  it('only requests the remote schema once', function() {
    schema();
    schema();
    expect(vg.schema).to.have.been.calledOnce;
  });

});
