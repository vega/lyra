/* eslint no-unused-expressions:0 */
'use strict';
var expect = require('chai').expect;

var actions = require('../constants/actions');
var primitiveActions = require('./primitiveActions');

describe('primitiveActions', function() {

  describe('addMark action creator', function() {
    var addMark;

    beforeEach(function() {
      addMark = primitiveActions.addMark;
    });

    it('is a function', function() {
      expect(addMark).to.be.a('function');
    });

    it('returns an action object', function() {
      var result = addMark({});
      expect(result).to.be.an('object');
      expect(result).to.have.property('type');
      expect(result.type).to.be.a('string');
      expect(result.type).to.equal(actions.PRIMITIVE_ADD_MARK);
    });

    it('sets a numeric ID on the returned object', function() {
      var result = addMark({});
      expect(result).to.have.property('id');
      expect(result.id).to.be.a('number');
    });

    it('sets a string name on the returned object', function() {
      var result = addMark({
        type: 'rect'
      });
      expect(result).to.have.property('name');
      expect(result.name).to.be.a('string');
      expect(/rect_\d+/.test(result.name)).to.equal(true);
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

    it('passes through the provided primitive properties', function() {
      var props = {
        type: 'line'
      };
      var result = addMark(props);
      expect(result).to.have.property('props');
      expect(result.props).to.deep.equal(props);
    });

  });

});
