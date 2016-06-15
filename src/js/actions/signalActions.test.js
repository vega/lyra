/* eslint no-unused-expressions:0 */
'use strict';

var expect  = require('chai').expect,
    actions = require('./signalActions'),
    initSignal = actions.initSignal,
    setSignal = actions.setSignal,
    setSignalStreams = actions.setSignalStreams,
    unsetSignal = actions.unsetSignal;

describe('Signal Actions', function() {
  describe('initSignal action creator', function() {

    it('returns an object', function() {
      var result = initSignal('');
      expect(result).to.be.an('object');
    });

    it('sets the correct signal type', function() {
      var result = initSignal('');
      expect(result).to.have.property('type');
      expect(result.type).to.equal(actions.INIT_SIGNAL);
      expect(result.signal).to.be.a('string');
    });

    it('namespaces the "signal" property of the action', function() {
      var result = initSignal('some_name');
      expect(result).to.have.property('signal');
      expect(result.signal).to.be.a('string');
      expect(result.signal).to.equal('lyra_some_name');
    });

    it('sets the provided value on the action object', function() {
      var val = {some: 'obj'};
      var result = initSignal('some_name', val);
      expect(result).to.have.property('value');
      expect(result.value).to.equal(val);
    });

  });

  describe('setSignal action creator', function() {

    it('returns an object', function() {
      var result = setSignal('');
      expect(result).to.be.an('object');
    });

    it('sets the correct signal type', function() {
      var result = setSignal('');
      expect(result).to.have.property('type');
      expect(result.type).to.equal(actions.SET_SIGNAL);
      expect(result.signal).to.be.a('string');
    });

    it('namespaces the "signal" property of the action', function() {
      var result = setSignal('some_name');
      expect(result).to.have.property('signal');
      expect(result.signal).to.be.a('string');
      expect(result.signal).to.equal('lyra_some_name');
    });

    it('sets the provided value on the action object', function() {
      var val = {some: 'obj'};
      var result = setSignal('some_name', val);
      expect(result).to.have.property('value');
      expect(result.value).to.equal(val);
    });

  });

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

  describe('unsetSignal action creator', function() {

    it('returns an object', function() {
      var result = unsetSignal('');
      expect(result).to.be.an('object');
    });

    it('sets the correct signal type', function() {
      var result = unsetSignal('');
      expect(result).to.have.property('type');
      expect(result.type).to.equal(actions.UNSET_SIGNAL);
    });

    it('sets and namespaces the "signal" property of the action', function() {
      var result = unsetSignal('some_name');
      expect(result).to.have.property('signal');
      expect(result.signal).to.be.a('string');
      expect(result.signal).to.equal('lyra_some_name');
    });

  });
});
