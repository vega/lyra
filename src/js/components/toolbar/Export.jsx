'use strict';
var React = require('react'),
    d3 = require('d3'),
    vg = require('vega'),
    ctrl = require('../../ctrl'),
    assets = require('../../util/assets'),
    Icon = require('../Icon'),
    createReactClass = require('create-react-class');

var RENDERER = {png: 'canvas', svg: 'svg'},
    MIME = {json: 'application/json', html: 'text/html'};

var Export = createReactClass({

  /**
   * Lyra's rendered visualization contains manipulators, so we re-render a
   * clean headless version to export as an image.
   * @param  {string} type Image format (png or svg).
   * @returns {void} File download of the png or svg image is triggered.
   */
  toImageURL: function(type) {
    var that = this, spec = ctrl.export();
    vg.parse.spec(spec, function(chart) {
      var view = chart({
        renderer: RENDERER[type]
      }).update();
      that.download(view.toImageURL(type), type);
    });
  },

  /**
   * Export and stringify the Vega specification for a file download.
   * @returns {void} File download of the JSON file is triggered.
   */
  toJSONURL: function() {
    var spec = JSON.stringify(ctrl.export(), null, 2);
    return this.toBlob(spec, 'json');
  },

  /**
   * Exports the specification and embeds it within the Vega HTML scaffolding.
   * @returns {void} File download of Vega HTML scaffolding,
   * with the spec embedded, is triggered.
   */
  toHTMLURL: function() {
    var spec = JSON.stringify(ctrl.export(), null, 2),
        html = assets.scaffold.replace('INJECT_SPEC', spec);
    return this.toBlob(html, 'html');
  },

  /**
   * Constructs a Blob URL for the given data, and triggers a file download.
   * @param  {Object|string} data Data to construct a blob from.
   * @param  {string} type Data type (json or html).
   * @returns {void}
   */
  toBlob: function(data, type) {
    var blob = new Blob([data], {type: MIME[type]}),
        url = window.URL.createObjectURL(blob);
    return this.download(url, type);
  },

  /**
   * Triggers a file download from the given URL, and with the given extension.
   * @param  {string} url URL to download.
   * @param  {string} ext File extension (e.g., png, svg, json, html)
   * @returns {void}   File download is triggered.
   */
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
