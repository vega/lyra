/* eslint no-unused-expressions:0 */
'use strict';
var expect = require('chai').expect;
var annotate = require('./annotate-manipulators');

describe('Annotate Manipulators utility', function() {
  it('it returns a function', function() {
    var annotated = annotate('x', 'span');
    expect(annotated).to.be.a('function');
  });

  it('it returns an object with key & manipulator when return called as a function', function() {
    var annotated = annotate('x+', 'arrow')({x: 100, y: 200});
    expect(annotated).to.deep.equal({
      x: 100, y: 200,
      key: 'x+', manipulator: 'arrow',
      tooltip: 'x+'
    });
  });

  it('it returns an object with key, manipulator, and tooltip when return called as a function', function() {
    var annotated = annotate('x', 'arrow', 'x position')({x: 100, y: 200});
    expect(annotated).to.deep.equal({
      x: 100, y: 200,
      key: 'x', manipulator: 'arrow',
      tooltip: 'x position'
    });
  });

});
