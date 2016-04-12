/* eslint no-unused-expressions:0 */
'use strict';
var expect = require('chai').expect;

var actions = require('../constants/actions');
var signalInit = require('./signalInit');

describe('signalInit action creator', function() {

  it('returns an object', function() {
    var result = signalInit('');
    expect(result).to.be.an('object');
  });

  it('sets the correct signal type', function() {
    var result = signalInit('');
    expect(result).to.have.property('type');
    expect(result.type).to.equal(actions.SIGNAL_INIT);
    expect(result.signal).to.be.a('string');
  });

  it('namespaces the "signal" property of the action', function() {
    var result = signalInit('some_name');
    expect(result).to.have.property('signal');
    expect(result.signal).to.be.a('string');
    expect(result.signal).to.equal('lyra_some_name');
  });

  it('sets the provided value on the action object', function() {
    var val = {some: 'obj'};
    var result = signalInit('some_name', val);
    expect(result).to.have.property('value');
    expect(result.value).to.equal(val);
  });

});
