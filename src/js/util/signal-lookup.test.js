/* eslint no-unused-expressions:0 */
'use strict';
var expect = require('chai').expect,
    signal = require('../ctrl/signals'),
    signalLookup = require('./signal-lookup');

describe('Signal Lookup utility', function() {
  beforeEach(function() {
    signal.init('lyra_rect_29_fill', '#4682b4');
  });

  it('is a function', function() {
    expect(signalLookup).to.be.a('function');
  });

  it('returns a the value in the store for a specific signal property', function() {
    expect(signalLookup('lyra_rect_29_fill')).to.equal('#4682b4');
  });

});
