var vg = require('vega'),
    _schema = null;

module.exports = function() {
  return _schema || (_schema = vg.schema({
    url: 'http://vega.github.io/vega/vega-schema.json'
  })); 
};