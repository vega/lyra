/* eslint no-unused-expressions:0 */
'use strict';
var expect = require('chai').expect;

var actions = require('../constants/actions');
var setSignalStreams = require('./setSignalStreams');

describe('setSignalStreams action creator', function() {

  it('returns an object', function() {
    var result = setSignalStreams('');
    expect(result).to.be.an('object');
  });

  it('sets the correct signal type', function() {
    var result = setSignalStreams('');
    expect(result).to.have.property('type');
    expect(result.type).to.equal(actions.SET_SIGNAL_STREAMS);
    expect(result.signal).to.be.a('string');
  });

  it('namespaces the "signal" property of the action', function() {
    var result = setSignalStreams('some_name');
    expect(result).to.have.property('signal');
    expect(result.signal).to.be.a('string');
    expect(result.signal).to.equal('lyra_some_name');
  });

  it('sets the provided value on the action object', function() {
    var val = {some: 'obj'};
    var result = setSignalStreams('some_name', val);
    expect(result).to.have.property('value');
    expect(result.value).to.equal(val);
  });

});
/**
 * Action creator to configure a property to update based on a stream.
 *
 * @param {string} signal - Name of a signal to connect to a stream
 * @param {Object[]} streams - Array of stream configuration objects
 * @returns {Object} An action object
 */
module.exports = function(signal, streams) {
  return {
    type: SET_SIGNAL_STREAMS,
    signal: ns(signal),
    value: streams
  };
};
