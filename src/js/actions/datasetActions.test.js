/* eslint no-unused-expressions:0 */
'use strict';

var expect = require('chai').expect,
    actions = require('./datasetActions'),
    sortDataset = actions.sortDataset,
    ORDER = require('../constants/sortOrder');

describe('Dataset Actions', function() {
  describe('sortDataset action creator', function() {

    it('returns an object', function() {
      var result = sortDataset(1, 'testField', ORDER.ASC);
      expect(result).to.be.an('object');
    });

    it('sets the correct action type', function() {
      var result = sortDataset(1, 'testField', ORDER.ASC);
      expect(result).to.have.property('type');
      expect(result.type).to.equal(actions.SORT_DATASET);
    });

    it('sets id property of the action', function() {
      var result = sortDataset(12, 'testField', ORDER.ASC);
      expect(result).to.have.property('id');
      expect(result.id).to.be.a('number');
      expect(result.id).to.equal(12);
    });

    it('sets field property of the action', function() {
      var result = sortDataset(12, 'testField', ORDER.ASC);
      expect(result).to.have.property('field');
      expect(result.field).to.be.a('string');
      expect(result.field).to.equal('testField');
    });

    it('sets order property of the action', function() {
      var result = sortDataset(12, 'testField', ORDER.ASC);
      expect(result).to.have.property('order');
      expect(result.order).to.be.a('string');
      expect(result.order).to.equal(ORDER.ASC);

      result = sortDataset(12, 'testField', ORDER.DESC);
      expect(result).to.have.property('order');
      expect(result.order).to.be.a('string');
      expect(result.order).to.equal(ORDER.DESC);
    });

  });
});
