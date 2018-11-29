'use strict';
import * as React from 'react';
const d3 = require('d3'),
  vg = require('vega'),
  ctrl = require('../../ctrl'),
  assets = require('../../util/assets'),
  Icon = require('../Icon');

const RENDERER: { [s: string]: string } = {
  png: 'canvas',
  svg: 'svg'
};
const MIME: { [s: string]: string } = {
  json: 'application/json',
  html: 'text/html'
};
export class Export extends React.Component {
  /**
   * Lyra's rendered visualization contains manipulators, so we re-render a
   * clean headless version to export as an image.
   * @param  {string} type Image format (png or svg).
   * @returns {void} File download of the png or svg image is triggered.
   */
  public toImageURL(type: string) {
    const that = this;
    const spec = ctrl.export();
    vg.parse.spec(spec, chart => {
      const view = chart({
        renderer: RENDERER[type]
      }).update();
      that.download(view.toImageURL(type), type);
    });
  }

  /**
   * Export and stringify the Vega specification for a file download.
   * @returns {void} File download of the JSON file is triggered.
   */
  public toJSONURL() {
    const spec = JSON.stringify(ctrl.export(), null, 2);
    return this.toBlob(spec, 'json');
  }

  /**
   * Exports the specification and embeds it within the Vega HTML scaffolding.
   * @returns {void} File download of Vega HTML scaffolding,
   * with the spec embedded, is triggered.
   */
  public toHTMLURL() {
    const spec = JSON.stringify(ctrl.export(), null, 2);
    const html = assets.scaffold.replace('INJECT_SPEC', spec);
    return this.toBlob(html, 'html');
  }

  /**
   * Constructs a Blob URL for the given data, and triggers a file download.
   * @param  {Object|string} data Data to construct a blob from.
   * @param  {string} type Data type (json or html).
   * @returns {void}
   */
  public toBlob(data: BlobPart, type: string) {
    const blob = new Blob([data], { type: MIME[type] });
    const url = window.URL.createObjectURL(blob);
    return this.download(url, type);
  }

  /**
   * Triggers a file download from the given URL, and with the given extension.
   * @param  {string} url URL to download.
   * @param  {string} ext File extension (e.g., png, svg, json, html)
   * @returns {void}   File download is triggered.
   */
  public download(url: string, ext: string) {
    const el = d3
      .select(document.createElement('a'))
      .attr('href', url)
      .attr('target', '_blank')
      .attr('download', 'lyra.' + ext)
      .node();

    const evt = document.createEvent('MouseEvents');
    evt.initMouseEvent(
      'click',
      true,
      true,
      document.defaultView,
      1,
      0,
      0,
      0,
      0,
      false,
      false,
      false,
      false,
      0,
      null
    );
    el.dispatchEvent(evt);
  }

  public render() {
    return (
      <ul>
        <li>
          <Icon glyph={assets.export} /> Export
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
}
