/* eslint no-unused-expressions:0 */
'use strict';
var expect = require('chai').expect;

var actions = require('../constants/actions');
var vegaInvalidate = require('./vegaInvalidate');

describe('vegaInvalidate action creator', function() {

  it('returns an object', function() {
    var result = vegaInvalidate('');
    expect(result).to.be.an('object');
  });

  it('sets the correct signal type', function() {
    var result = vegaInvalidate('');
    expect(result).to.have.property('type');
    expect(result.type).to.equal(actions.VEGA_INVALIDATE);
  });

  it('sets the provided value on the action object', function() {
    var result = vegaInvalidate(true);
    expect(result).to.have.property('value');
    expect(result.value).to.be.true;
    result = vegaInvalidate(false);
    expect(result).to.have.property('value');
    expect(result.value).to.be.false;
  });

  it('coerces the provided value to a boolean', function() {
    var result = vegaInvalidate(1);
    expect(result).to.have.property('value');
    expect(result.value).to.be.true;
    result = vegaInvalidate(0);
    expect(result).to.have.property('value');
    expect(result.value).to.be.false;
  });

});
