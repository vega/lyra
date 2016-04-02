/* eslint no-unused-expressions:0 */
'use strict';
var expect = require('chai').expect;
var signalReference = require('./signal-reference');

describe('Signal Reference utility', function() {

  it('is a function', function() {
    expect(signalReference).to.be.a('function');
  });

  it('returns a signal identifier string for the specified property', function() {
    expect(signalReference('rect', 2501, 'x')).to.equal('lyra_rect_2501_x');
    expect(signalReference('text', 42, 'fill')).to.equal('lyra_text_42_fill');
  });

});
