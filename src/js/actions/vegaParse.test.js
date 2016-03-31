/* eslint no-unused-expressions:0 */
'use strict';
var expect = require('chai').expect;

var actions = require('../constants/actions');
var vegaParse = require('./vegaParse');

describe('vegaParse action creator', function() {

  it('returns an object', function() {
    var result = vegaParse('');
    expect(result).to.be.an('object');
  });

  it('sets the correct signal type', function() {
    var result = vegaParse('');
    expect(result).to.have.property('type');
    expect(result.type).to.equal(actions.VEGA_PARSE);
  });

  it('sets the provided value on the action object', function() {
    var result = vegaParse(true);
    expect(result).to.have.property('value');
    expect(result.value).to.be.true;
    result = vegaParse(false);
    expect(result).to.have.property('value');
    expect(result.value).to.be.false;
  });

  it('coerces the provided value to a boolean', function() {
    var result = vegaParse(1);
    expect(result).to.have.property('value');
    expect(result.value).to.be.true;
    result = vegaParse(0);
    expect(result).to.have.property('value');
    expect(result.value).to.be.false;
  });

});
