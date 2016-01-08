var ReactDOM = require('react-dom'),
    Inspectors = require('./Inspectors.jsx');

module.exports = ReactDOM.render(
  <Inspectors />,
  d3.select('#inspectors').node()
);