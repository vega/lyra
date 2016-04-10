'use strict';
var React = require('react'),
    d3 = require('d3'),
    vg = require('vega'),
    connect = require('react-redux').connect,
    model = require('../../model'),
    assets = require('../../util/assets'),
    Icon = require('../Icon');

// Split out into each section
var RENDERER = {png: 'canvas', svg: 'svg'},
    MIME = {json: 'application/json', html: 'text/html'};

var Export = React.createClass({
  toImageURL: function(type) {
    var self = this, spec = model.export();
    vg.parse.spec(spec, function(chart) {
      var view = chart({ renderer: RENDERER[type] }).update();
      self.download(view.toImageURL(type), type);
    });
  },

  toJSONURL: function() {
    var spec = JSON.stringify(model.export(), null, 2);
    return this.toBlob(spec, 'json');
  },

  toHTMLURL: function() {
    var spec = JSON.stringify(model.export(), null, 2),
        html = assets.scaffold.replace('INJECT_SPEC', spec);
    return this.toBlob(html, 'html');
  },

  toBlob: function(data, type) {
    var blob = new Blob([data], {type: MIME[type]}),
        url  = window.URL.createObjectURL(blob);
    return this.download(url, type);
  },

  download: function(url, ext) {
    var el = d3.select(document.createElement('a'))
      .attr('href', url)
      .attr('target', '_blank')
      .attr('download', 'lyra.' + ext)
      .node();

    var evt = document.createEvent('MouseEvents');
    evt.initMouseEvent('click', true, true, document.defaultView, 1, 0, 0, 0, 0,
      false, false, false, false, 0, null);
    el.dispatchEvent(evt);
  },

  render: function() {
    return (
      <ul className={this.classNames}>
        <li><Icon glyph={assets.export} /> Export
          <ul>
            <li onClick={this.toImageURL.bind(null, 'png')}>As PNG</li>
            <li onClick={this.toImageURL.bind(null, 'svg')}>As SVG</li>
            <li onClick={this.toJSONURL}>As JSON</li>
            <li onClick={this.toHTMLURL}>As HTML</li>
          </ul>
        </li>
      </ul>
    );
  }
});

module.exports = Export;
