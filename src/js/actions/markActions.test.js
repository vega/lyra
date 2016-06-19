/* eslint no-unused-expressions:0 */
'use strict';

var expect = require('chai').expect,
    actions = require('./markActions'),
    counter = require('../util/counter'),
    Mark = require('../store/factory/Mark'),
    addMark = actions.addMark;

describe('Mark Actions', function() {
  describe('addMark action creator', function() {
    beforeEach(function() {
      counter.reset();
    });

    it('is a function', function() {
      expect(addMark).to.be.a('function');
    });

    it('returns an action object', function() {
      var result = addMark(Mark('rect'));
      expect(result).to.be.an('object');
      expect(result).to.have.property('type');
      expect(result.type).to.be.a('string');
      expect(result.type).to.equal(actions.ADD_MARK);
    });

    it('sets a numeric ID on the returned object', function() {
      var result = addMark(Mark('rect'));
      expect(result).to.have.property('id');
      expect(result.id).to.be.a('number');
    });

    it('sets a string name on the returned object', function() {
      var result = addMark(Mark('rect'));
      expect(result).to.have.property('name');
      expect(result.name).to.be.a('string');
      expect(/rect\s\d+/.test(result.name)).to.equal(true);
    });

    it('passes through a provided name in the returned object', function() {
      var result = addMark({
        name: 'special_rect',
        type: 'rect'
      });
      expect(result).to.have.property('name');
      expect(result.name).to.be.a('string');
      expect(result.name).to.equal('special_rect');
    });

    it('passes through and augments the provided mark properties', function() {
      var props = Mark('line');
      var result = addMark(props);
      expect(result).to.have.property('props');
      expect(result.props).not.to.equal(props);
      expect(result.props).to.contain.all.keys({
        _id: 1,
        name: 'line 1',
        type: 'line'
      });
    });

    it('sets a relevant streams object on the returned object', function() {
      var result = addMark(Mark('line', {_id: 2501}));
      expect(result).to.have.property('streams');
      expect(result.streams).to.be.an('object');
      expect(Object.keys(result.streams).sort()).to.deep.equal([
        'lyra_line_2501_x',
        'lyra_line_2501_y'
      ]);
    });

  });

  it('creates a deleteMark action');
  it('creates a setParent action');
  it('creates a updateMarkProperty action');

});
