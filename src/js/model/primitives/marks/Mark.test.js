/* eslint no-unused-expressions:0 */
'use strict';

var expect = require('chai').expect;
var Mark = require('./Mark'),
    store = require('../../../store'),
    getIn = require('../../../util/immutable-utils').getIn;

describe('Mark', function() {
  var newMark;
  describe('remove method', function() {
    beforeEach(function() {
      newMark = new Mark();
      newMark.init();
    });
    it('removes it\'s signals from the store', function() {
      // first check that that they exist
      var update = newMark.properties.update,
          signalName,
          signalValue,
          key;
      for (key in update) {
        signalName = update[key].signal;
        signalValue = getIn(store.getState(), 'signals.' + signalName);
        expect(signalValue).to.not.be.undefined;
      }
      // get rid of em
      newMark.remove();
      for (key in update) {
        signalName = update[key].signal;
        signalValue = getIn(store.getState(), 'signals.' + signalName);
        expect(signalValue).to.be.undefined;
      }
    });
  });

});
