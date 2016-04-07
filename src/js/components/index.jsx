'use strict';
var ReactDOM = require('react-dom'),
    Sidebars = require('./Sidebars'),
    React = require('react'),
    Provider = require('react-redux').Provider,
    store = require('../store');

//var applyMiddleware = require('redux').applyMiddleware;
// var wk = require('./actions/walkthrough');
// store.dispatch(wk.loadWalkthrough('example', './walkthrough/files/example.json'));

// React requires you only have one wrapper element called in your provider
module.exports = ReactDOM.render(
  <Provider store={store}>
    <Sidebars/>
  </Provider>,
  d3.select('#sidebars').node()
);
window.ui = module.exports;
