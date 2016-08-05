/* eslint no-unused-expressions:0,new-cap:0 */
'use strict';

var React = require('react'),
    expect = require('chai').expect,
    enzyme = require('enzyme'),
    Immutable = require('immutable'),
    mount  = enzyme.mount,
    configureMockStore = require('redux-mock-store'),
    UndoRedo = require('./UndoRedo'),
    ACTIONS = require('../../actions/Names');

describe('UndoRedo Toolbar <UndoRedo/>', function() {
  var mockStore, wrapper, store;

  function createStore(state) {
    return (store = mockStore(Immutable.Map({
      vis: state || {past: [], present: 0, future: []}
    })));
  }

  beforeEach(function() {
    // mockStore is a function that can be called with a default state object
    // to create a mock store instance which can be passed to a component via
    // the enzyme renderer's context option
    mockStore = configureMockStore([]);
  });

  it('renders undo and redo buttons', function() {
    wrapper = mount(<UndoRedo />, {context: {store: createStore()}});
    var li = wrapper.find('li');
    expect(li.at(0).find('.undo')).to.have.length(1);
    expect(li.at(1).find('.redo')).to.have.length(1);
  });

  it('greys out undo button if no past states', function() {
    wrapper = mount(<UndoRedo />, {
      context: {store: createStore({past: [0], present: 1, future: []})}
    });
    expect(wrapper.find('li').at(0).hasClass('grey')).to.be.false;

    wrapper = mount(<UndoRedo />, {
      context: {store: createStore({past: [], present: 1, future: [2]})}
    });
    expect(wrapper.find('li').at(0).hasClass('grey')).to.be.true;
  });

  it('greys out redo button if no future states', function() {
    wrapper = mount(<UndoRedo />, {
      context: {store: createStore({past: [], present: 1, future: [2]})}
    });
    expect(wrapper.find('li').at(1).hasClass('grey')).to.be.false;

    wrapper = mount(<UndoRedo />, {
      context: {store: createStore({past: [0], present: 1, future: []})}
    });
    expect(wrapper.find('li').at(1).hasClass('grey')).to.be.true;
  });

  it('dispatches an undo action onclick', function() {
    wrapper = mount(<UndoRedo />, {context: {store: createStore()}});
    wrapper.find('li').at(0).simulate('click');
    expect(store.getActions()[0]).to.have.property('type', ACTIONS.UNDO);
  });

  it('dispatches a redo action onclick', function() {
    wrapper = mount(<UndoRedo />, {context: {store: createStore()}});
    wrapper.find('li').at(1).simulate('click');
    expect(store.getActions()[0]).to.have.property('type', ACTIONS.REDO);
  });
});
