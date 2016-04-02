/* eslint no-unused-expressions:0 */
'use strict';
var expect = require('chai').expect;

var counter = require('./counter');

describe('markName utility', function() {
  var markName;

  beforeEach(function() {
    // Reset counters module so that we can have predictable IDs for our names
    counter.reset();
    markName = require('./markName');
  })

  it('is a function', function() {
    expect(markName).to.be.a('function');
  });

  it('returns a well-formed mark string', function() {
    expect(markName('text')).to.equal('text_1');
    expect(markName('rect')).to.equal('rect_1');
    expect(markName('line')).to.equal('line_1');
  });

  it('returns incrementing IDs when called repeatedly with the same type', function() {
    expect(markName('text')).to.equal('text_1');
    expect(markName('rect')).to.equal('rect_1');
    expect(markName('rect')).to.equal('rect_2');
    expect(markName('line')).to.equal('line_1');
    expect(markName('text')).to.equal('text_2');
    expect(markName('rect')).to.equal('rect_3');
  });

});
