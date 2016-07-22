/* eslint no-unused-expressions:0,new-cap:0 */
'use strict';

var React = require('react'),
    expect = require('chai').expect,
    enzyme = require('enzyme'),
    configureMockStore = require('redux-mock-store'),
    AddMarks = require('./AddMarks'),
    ACTIONS = require('../../actions/Names');

describe('AddMarks Toolbar <AddMarks/>', function() {
  var mockStore, wrapper, store;

  beforeEach(function() {
    // mockStore is a function that can be called with a default state object
    // to create a mock store instance which can be passed to a component via
    // the enzyme renderer's context option
    mockStore = configureMockStore([]);
    wrapper = enzyme.mount(<AddMarks />, {
      context: {store: (store = mockStore())}
    });
  });

  it('renders supported mark types', function() {
    var li = wrapper.find('li');
    expect(li).to.have.length(5);
    expect(li.at(0).text().trim()).to.equal('rect');
    expect(li.at(1).text().trim()).to.equal('symbol');
    expect(li.at(2).text().trim()).to.equal('text');
    expect(li.at(3).text().trim()).to.equal('line');
    expect(li.at(4).text().trim()).to.equal('area');
  });

  it('adds a mark onclick', function() {
    wrapper.find('li').at(0).simulate('click');
    var action = store.getActions()[0];
    expect(action).to.have.property('type', ACTIONS.ADD_MARK);
    expect(action).to.have.deep.property('props.type', 'rect');
  });
});
