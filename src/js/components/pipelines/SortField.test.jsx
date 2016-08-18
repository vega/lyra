/* eslint no-unused-expressions:0,new-cap:0 */
'use strict';

var React = require('react'),
    expect = require('chai').expect,
    enzyme = require('enzyme'),
    shallow = enzyme.shallow,
    SortField = require('./SortField').disconnected,
    measureTypes = require('../../constants/measureTypes'),
    wrapper;

describe('SortField Component <SortField/>', function() {

  beforeEach(function() {
    var field = { mtype: measureTypes[0] },
        dsId = 0;
    wrapper = shallow(<SortField field={field} dsId={dsId} />);
  });

  // Renders component correctly
  describe('Render', function() {

    it('renders Icon', function() {
      expect(wrapper.find('Icon')).to.have.length(1);

    });



  });

});
