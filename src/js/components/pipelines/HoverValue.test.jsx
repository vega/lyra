/* eslint no-unused-expressions:0,new-cap:0 */
'use strict';

var React = require('react'),
    expect = require('chai').expect,
    enzyme = require('enzyme'),
    shallow = enzyme.shallow,
    DataTable = require('./HoverValue'),
    wrapper;

describe('HoverValue Component <HoverValue/>'), function() {

  // Will need to figure out if HoverValue needs to be tested rigorously since it only renders
  // and there are not event handlers.
  describe('Rendering', function() {

    beforeEach(function() {
      wrapper = shallow(<HoverValue />);
    });

  });
}
