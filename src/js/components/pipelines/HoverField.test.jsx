/* eslint no-unused-expressions:0,new-cap:0 */
'use strict';

var React = require('react'),
    expect = require('chai').expect,
    enzyme = require('enzyme'),
    shallow = enzyme.shallow,
    HoverField = require('./HoverField'),
    dsUtil = require('../../util/dataset-utils'),
    wrapper;

describe('HoverField Component <HoverField/>', function() {

  // Tests initial values of states
  describe('Default state', function() {

    beforeEach(function() {
      var id = 1,
          schema = dsUtil.schema(id),
          def = {},
          hoverField = '';
      wrapper = shallow(<HoverField dsId={id} schema={schema}
        def={def} hoverField={hoverField} />);
    });

    it('valid init fieldDef', function() {
      expect(wrapper.state('fieldDef')).to.be.null;
    });

    it('valid init offsetTop', function() {
      expect(wrapper.state('offsetTop')).to.be.null;
    });

    it('valid init bindField', function() {
      expect(wrapper.state('bindField')).to.be.null;
    });

  });
});
