'use strict';

var expect = require('chai').expect,
    enzyme = require('enzyme'),
    shallow = enzyme.shallow,
    mount = enzyme.mount,
    React = require('react'),
    configureMockStore = require('redux-mock-store'),
    PipelineModal = require('./PipelineModal').Undecorated,
    DataPreview = require('./DataPreview'),
    TextArea = require('./TextArea'),
    Form = require('./Form');

describe('PipelineModal Component <PipelineModal />', function() {
  var mockStore, wrapper, props;

  beforeEach(function() {
    mockStore = configureMockStore([]);
  });

  // this suite ensures the PipelineModal component
  // has the correct default behavior when opened and
  // closed
  describe('Default state', function() {
    // pack these tighter; possibly even condense the two together
    describe('default state when open', function() {
      beforeEach(function() {
        props = {
          selectPipeline: function() {},
          closeModal: function() {},
          modalIsOpen: true
        };

        wrapper = shallow(<PipelineModal {...props} />, {
          context: {store: mockStore({})}
        });
      });

      // series of its that check for correct values in getInitialState
      it('doesn\'t provide feedback', function() {
        var defaultFeedBack = {
          value: false,
          message: ''
        };
        expect(wrapper.state('error')).eql(defaultFeedBack);
        expect(wrapper.state('success')).eql(defaultFeedBack);
      });
      it('shouldn\'t have values', function() {
        expect(wrapper.state('values')).eql([]);
      });
      it('shouldn\'t have a schema', function() {
        expect(wrapper.state('schema')).eql({});
      });
      it('not in preview mode', function() {
        expect(wrapper.state('showPreview')).to.equal(false);
      });
    });

    describe('default state closed', function() {
      beforeEach(function() {
        props = {
          selectPipeline: function() {},
          closeModal: function() {},
          modalIsOpen: false
        };

        wrapper = shallow(<PipelineModal {...props} />, {
          context: {store: mockStore({})}
        });
      });

      it('doesn\'t provide feedback', function() {
        var defaultFeedBack = {
          value: false,
          message: ''
        };
        expect(wrapper.state('error')).eql(defaultFeedBack);
        expect(wrapper.state('success')).eql(defaultFeedBack);
      });
      it('shouldn\'t have values', function() {
        expect(wrapper.state('values')).eql([]);
      });
      it('shouldn\'t have a schema', function() {
        expect(wrapper.state('schema')).eql({});
      });
      it('not in preview mode', function() {
        expect(wrapper.state('showPreview')).to.equal(false);
      });
    });
  });

  // this suite aims to ensure PipelineModal has proper structure
  // things to verify: appropriate child components present,
  // appropriate markup is present
  describe('Child elements', function() {
    beforeEach(function() {
      props = {
        selectPipeline: function() {},
        closeModal: function() {},
        modalIsOpen: true
      };

      wrapper = shallow(<PipelineModal {...props} />, {
        context: {store: mockStore({})}
      });
    });

    it('renders Form', function() {

      /*
        verify that the Form component exists.
        if additional details about its existance
        is needed, fine.
      */
      expect(wrapper.find(Form)).to.have.length(1);
    });

    it('renders TextArea', function() {

      /*
        verfify that the TextArea component exists.
        ensure its ui behavior is as expected
      */
      expect(wrapper.find(TextArea)).to.have.length(1);
    });

    it('renders example pipelines', function() {

      /*
        find a better implementation for this test;
        something along the lines of `ul with at least
        one li`.
      */
      expect(wrapper.find('.item-li')).to.have.length(4);
    });

    // add more tests that check for structure of
    // PipelineModal
  });

  /* HARDEST PART OF THE UNIT TEST STILL REMAINS */
  // this stuite ensures all necessary information driving the
  // data import behavior (urls for data import, cp content, file drops)
  // provokes proper PipelineModal behavior e.g. return of correct feedback
  describe('Data import', function() {
    describe('user input validated', function() {
      it('validates url', function() {

        /*
          implement url loading simulation
          and implement test to check for success/error
        */
      });

      it('validates url copy & paste content', function() {

        /*
          implement copy & paste simulation
          and implement test for correct PipelineModal
          behavior
        */
      });

      it('validates file drag and drop', function() {

        /*
          implement drag & drop simulation
          and implement test for feedback PipelineModal
          generates
        */
      });
    });

  });
});
