var ReactDOM = require('react-dom'),
    Sidebars = require('./Sidebars.jsx'),
    React = require('react');

module.exports = ReactDOM.render(
  <Sidebars />,
  d3.select('#sidebars').node()
);
