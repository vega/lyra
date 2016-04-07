/* eslint no-unused-expressions:0 */
'use strict';
var expect = require('chai').expect;

var actions = require('../constants/actions');
var signalUnset = require('./signalUnset');

describe('signalUnset action creator', function() {

  it('returns an object', function() {
    var result = signalUnset('');
    expect(result).to.be.an('object');
  });

  it('sets the correct signal type', function() {
    var result = signalUnset('');
    expect(result).to.have.property('type');
    expect(result.type).to.equal(actions.SIGNAL_UNSET);
  });

  it('sets and namespaces the "signal" property of the action', function() {
    var result = signalUnset('some_name');
    expect(result).to.have.property('signal');
    expect(result.signal).to.be.a('string');
    expect(result.signal).to.equal('lyra_some_name');
  });

});
