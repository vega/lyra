'use strict';

var React = require('react'),
    expect = require('chai').expect,
    configureMockStore = require('redux-mock-store'),
    dl = require('datalib'),
    enzyme = require('enzyme'),
    shallow = enzyme.shallow,
    PipelineModal = require('./PipelineModal').disconnected,
    Loader = require('./Loader'),
    DraggableTextArea = require('./DraggableTextArea'),
    Modal = require('react-modal');

var MOCK_DATA = require('./../../constants/mockdata');

describe('PipelineModal component <PipelineModal/> ', function() {
  var mockStore, wrapper, props;

  beforeEach(function() {
    mockStore = configureMockStore([]);
  });

  describe('Raw value parsing', function() {
    var parseRaw, dataset, raw, invalidRaw, parsed;

    beforeEach(function() {
      props = {
        closeModal: function() {},
        modalIsOpen: true
      };

      wrapper = shallow(<PipelineModal {...props} />, {
        context: {store: mockStore({})}
      });
      parseRaw = wrapper.instance().parseRaw;
      dataset = {
        format: {parse: 'auto', type: ''},
        name: 'name'
      };
    });

    it('parses valid json', function() {
      raw = MOCK_DATA.VALID_JSON;
      dataset.format.type = 'json';
      parsed = dl.read(raw, dataset.format);
      expect(parseRaw(raw, dataset)).to.eql(parsed);
    });
    it('throws on invalid json', function() {
      invalidRaw = MOCK_DATA.INVALID_JSON;
      dataset.format.type = 'json';
      function tryParse() {
        parseRaw(invalidRaw, dataset);
      }
      expect(tryParse).to.throw(Error);
    });
    it('correctly parses csv', function() {
      raw = MOCK_DATA.VALID_CSV;
      dataset.format.type = 'csv';
      parsed = dl.read(raw, dataset.format);
      expect(parseRaw(raw, dataset)).to.eql(parsed);
    });
    it('correctly parses tsv', function() {
      dataset.format.type = 'tsv';
      raw = MOCK_DATA.VALID_TSV;
      parsed = dl.read(raw, dataset.format);
      expect(parseRaw(raw, dataset)).to.eql(parsed);
    });

    it('loads data from url');
    it('loads data from copy & paste');
    it('loads data through drag & drop');
  });

  describe('Dispatchers', function() {
    beforeEach(function() {
      props = {
        closeModal: function() {},
        modalIsOpen: true
      };

      wrapper = shallow(<PipelineModal {...props} />, {
        context: {store: mockStore({})}
      });
    });

    it('selects pipelines');
  });

  describe('Default state ui', function() {
    beforeEach(function() {
      props = {
        closeModal: function() {},
        modalIsOpen: true
      };

      wrapper = shallow(<PipelineModal {...props} />, {
        context: {store: mockStore({})}
      });
    });

    it('has <Modal/> component', function() {
      expect(wrapper.find(Modal)).to.have.length(1);
    });
    it('has <Form/> component', function() {
      expect(wrapper.find(Loader)).to.have.length(1);
    });
    it('has <TextArea/> component', function() {
      expect(wrapper.find(DraggableTextArea)).to.have.length(1);
    });
  });
});
