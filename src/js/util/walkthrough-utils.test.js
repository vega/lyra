/* eslint no-unused-expressions:0 */
'use strict';
var expect = require('chai').expect;
var walkthrough = require('./walkthrough-utils');

describe('validate', function() {

  it('is a function', function() {
    expect(walkthrough.validate).to.be.a('function');
  });

  it('returns a success if the state and expected state match', function() {
    var current = {
      marks: [{
        type: 'rect'
      }]
    };
    var message = walkthrough.validate(current, current);
    expect(message.success_status).to.be.true;
  });

  it('returns a failure if the state and expected state do not match', function() {
    var current = {
      marks: [{
        type: 'rect'
      }]
    };
    var expected = {
      marks: [{
        type: 'symbol'
      }]
    };
    var message = walkthrough.validate(current, expected);
    expect(message.success_status).to.be.false;
  });

  it('returns a failure if it does not find multiple of the same type', function() {
    var current = {
      marks: [{
        type: 'rect'
      }]
    };
    var expected = {
      marks: [{
        type: 'rect'
      }, {
        type: 'rect'
      }]
    };
    var message = walkthrough.validate(current, expected);
    expect(message.success_status).to.be.false;
  });

  it('returns a failure if the state if the properties do not exist', function() {
    var current = {
      marks: [{
        type: 'rect'
      }]
    };

    var expected = {
      marks: [{
        type: 'rect',
        properties: {
          update: {
            fill: {
              value: 'salmon'
            }
          }
        }
      }]
    };
    var message = walkthrough.validate(current, expected);
    expect(message.success_status).to.be.false;
  });

});
