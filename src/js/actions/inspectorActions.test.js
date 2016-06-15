/* eslint no-unused-expressions:0 */
'use strict';

var expect = require('chai').expect,
    actions = require('./inspectorActions'),
    selectScale = actions.selectScale,
    showScaleInspector = actions.showScaleInspector;

describe('Inspector Actions', function() {
  describe('showScaleInspector action creator', function() {

    it('returns an object', function() {
      var result = showScaleInspector(true);
      expect(result).to.be.an('object');
    });

    it('sets the correct signal type', function() {
      var result = showScaleInspector(true);
      expect(result).to.have.property('type');
      expect(result.type).to.equal(actions.SHOW_SCALE_INSPECTOR);
    });

    it('sets show property of the action', function() {
      var result = showScaleInspector(true);
      expect(result).to.have.property('show');
      expect(result.show).to.be.a('boolean');
      expect(result.show).to.equal(true);
    });

  });

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
