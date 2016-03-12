/* eslint no-unused-expressions:0 */
'use strict';
var expect = require('chai').expect;

var anchorTarget = require('./anchor-target');
var Rect = require('../model/primitives/marks/Rect');

describe('anchor target utility', function() {
  var mark;

  beforeEach(function() {
    mark = new Rect();
    // Manually override rect mark ID to prevent test order from changing results
    mark._id = 2501;
    mark.name = 'rect_name';
  });

  it('is a function', function() {
    expect(anchorTarget).to.be.a('function');
  });

  it('returns a string', function() {
    var result = anchorTarget(mark);
    expect(result).to.be.a('string');
  });

  it('returns an anchor target expression for a mark', function() {
    var expected = '(lyra_anchor&&lyra_anchor.target&&lyra_anchor.target.datum &&lyra_anchor.target.mark && lyra_anchor.target.mark.name === "rect_name")';
    var result = anchorTarget(mark);
    expect(result).to.equal(expected);
  });

  it('returns an anchor target expression for mark handles', function() {
    var expected = '(lyra_anchor&&lyra_anchor.target&&lyra_anchor.target.datum &&lyra_anchor.target.mark && lyra_anchor.target.mark.name === "rect_name")';
    var result = anchorTarget(mark, 'handles');
    expect(result).to.equal(expected);
  });

  describe('keyed manipulator expressions', function() {
    var at;

    beforeEach(function() {
      at = anchorTarget.bind(null, mark, 'handles');
    });

    it('can be used via partial application', function() {
      var expected = '(lyra_anchor&&lyra_anchor.target&&lyra_anchor.target.datum &&lyra_anchor.target.mark && lyra_anchor.target.mark.name === "rect_name")';
      expect(at()).to.equal(expected);
    });

    it('returns an anchor target expression for a top manipulator', function() {
      var expected = '(lyra_anchor&&lyra_anchor.target&&lyra_anchor.target.datum &&lyra_anchor.target.datum.mode === "handles" &&lyra_anchor.target.datum.lyra_id === 2501&&test(regexp("top", "i"), lyra_anchor.target.datum.key))';
      expect(at('top')).to.equal(expected);
    });

    it('returns an anchor target expression for a right manipulator', function() {
      var expected = '(lyra_anchor&&lyra_anchor.target&&lyra_anchor.target.datum &&lyra_anchor.target.datum.mode === "handles" &&lyra_anchor.target.datum.lyra_id === 2501&&test(regexp("right", "i"), lyra_anchor.target.datum.key))';
      expect(at('right')).to.equal(expected);
    });

    it('returns an anchor target expression for a bottom manipulator', function() {
      var expected = '(lyra_anchor&&lyra_anchor.target&&lyra_anchor.target.datum &&lyra_anchor.target.datum.mode === "handles" &&lyra_anchor.target.datum.lyra_id === 2501&&test(regexp("bottom", "i"), lyra_anchor.target.datum.key))';
      expect(at('bottom')).to.equal(expected);
    });

    it('returns an anchor target expression for a left manipulator', function() {
      var expected = '(lyra_anchor&&lyra_anchor.target&&lyra_anchor.target.datum &&lyra_anchor.target.datum.mode === "handles" &&lyra_anchor.target.datum.lyra_id === 2501&&test(regexp("left", "i"), lyra_anchor.target.datum.key))';
      expect(at('left')).to.equal(expected);
    });

  });

});
