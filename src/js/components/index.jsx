'use strict';
var ReactDOM = require('react-dom'),
    Sidebars = require('./Sidebars'),
    React = require('react'),
    Provider = require('react-redux').Provider,
    configureStore = require('../store/configureStore');

var store = configureStore;

module.exports = ReactDOM.render(
  <Provider store={store}>
    <Sidebars />
  </Provider>,
  d3.select('#sidebars').node()
);
