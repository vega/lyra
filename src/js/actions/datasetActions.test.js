/* eslint no-unused-expressions:0 */
'use strict';

var expect = require('chai').expect,
    actions = require('./datasetActions'),
    sortDataset = actions.sortDataset;

describe('Dataset Actions', function() {
  describe('sortDataset action creator', function() {

    it('returns an object', function() {
      var result = sortDataset(1, 'testField', 'inc');
      expect(result).to.be.an('object');
    });

    it('sets the correct action type', function() {
      var result = sortDataset(1, 'testField', 'inc');
      expect(result).to.have.property('type');
      expect(result.type).to.equal(actions.SORT_DATASET);
    });

    it('sets id property of the action', function() {
      var result = sortDataset(12, 'testField', 'inc');
      expect(result).to.have.property('id');
      expect(result.id).to.be.a('number');
      expect(result.id).to.equal(12);
    });

    it('sets sortField property of the action', function() {
      var result = sortDataset(12, 'testField', 'inc');
      expect(result).to.have.property('sortField');
      expect(result.sortField).to.be.a('string');
      expect(result.sortField).to.equal('testField');
    });

    it('sets sortOrder property of the action', function() {
      var result = sortDataset(12, 'testField', 'inc');
      expect(result).to.have.property('sortOrder');
      expect(result.sortOrder).to.be.a('string');
      expect(result.sortOrder).to.equal('inc');
    });

  });
});
