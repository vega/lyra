/* eslint no-unused-expressions:0 */
'use strict';

var expect = require('chai').expect,
    actions = require('./inspectorActions'),
    selectScale = actions.selectScale;

describe('Inspector Actions', function() {
  describe('selectScale action creator', function() {

    it('returns an object', function() {
      var result = selectScale(1);
      expect(result).to.be.an('object');
    });

    it('sets the correct action type', function() {
      var result = selectScale(1);
      expect(result).to.have.property('type');
      expect(result.type).to.equal(actions.SELECT_SCALE);
    });

    it('sets id property of the action', function() {
      var result = selectScale(12);
      expect(result).to.have.property('id');
      expect(result.id).to.be.a('number');
      expect(result.id).to.equal(12);
    });

  });
});
