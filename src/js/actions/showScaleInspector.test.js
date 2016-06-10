/* eslint no-unused-expressions:0 */
'use strict';
var expect = require('chai').expect;

var actions = require('../constants/actions');
var showScaleInspector = require('./showScaleInspector');

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
