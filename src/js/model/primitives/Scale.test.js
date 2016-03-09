/* eslint no-unused-expressions:0 */
'use strict';
var expect = require('chai').expect;

var Scale = require('./Scale');
var scaleA,
    scaleB,
    specA,
    specB,
    domain,
    def,
    multipleDomains;

beforeEach(function() {
  def = {
    name: 'x',
    padding: 1,
    points: true,
    range: 'width',
    round: true,
    type: 'ordinal'
  };

  domain = {
    data: 'source',
    field: 'year'
  };
  multipleDomains = [
    {data: 'table1', field: 'price'},
    {data: 'table2', field: 'cost'}
  ];

  scaleA = new Scale(def.name, def.type, domain, def.range);
  scaleB = new Scale(def.name, def.type, multipleDomains, def.range);
  specA = scaleA.export(false);
  specB = scaleB.export(false);
});

describe('Scale primative', function() {
  it('Scale primitive initializes with name, type, domain, range', function() {
    expect(scaleA.name).to.exist;
    expect(scaleA.type).to.equal(def.type);
    expect(scaleA.domain).to.equal(domain);
    expect(scaleA.range).to.equal(def.range);
  });

  it('Scale primitive initializes does not initialize with existing name', function() {
    expect(scaleB.name).to.not.equal(scaleA.name);
  });

});

describe('dataRef in scale', function() {
  it('Range returns as string when single range exists, single dataset', function() {
    expect(specA.domain).to.be.an('object');
    expect(specA.domain).to.not.have.ownProperty('length');
  });

  it('Range returns as array for multiple fields, single dataset', function() {
    expect(specB.domain).to.be.an('array');
    expect(specB.domain).to.have.ownProperty('length');
  });

});
