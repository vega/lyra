/* eslint no-unused-expressions:0 */
'use strict';

var expect = require('chai').expect,
    actions = require('./scaleActions'),
    addScale = actions.addScale;

describe('Scale Actions', function() {
  describe('addScale action creator', function() {

    it('returns an object', function() {
      var result = addScale({foo: 'bar'});
      expect(result).to.be.an('object');
    });

    it('sets the correct signal type', function() {
      var result = addScale({foo: 'bar'});
      expect(result).to.have.property('type');
      expect(result.type).to.equal(actions.ADD_SCALE);
    });

    it('sets props property of the action', function() {
      var result = addScale({foo: 'bar', _id: 1});
      expect(result).to.have.property('props');
      expect(result.props).to.be.a('object');
      expect(result.props).to.eql({_id: 1, foo: 'bar'});
    });

  });

  it('creates an updateScale action');
});
