/* eslint no-unused-expressions:0 */
'use strict';
var expect = require('chai').expect;
var propSg = require('./prop-signal');

describe('Property Signal utility', function() {

  it('is a function', function() {
    expect(propSg).to.be.a('function');
  });

  it('returns a signal identifier string for the specified property', function() {
    // manually set mark's _id so that it is predictable in tests: this
    // will normally be an incrementing ID set in Primitive's constructor.
    // @todo: determine whether there's a more elegant way to handle this case
    var result = propSg(2501, 'rect', 'propname');
    expect(result).to.equal('lyra_rect_2501_propname');
  });

});
