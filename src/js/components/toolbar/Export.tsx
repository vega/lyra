import * as React from 'react';
import * as vg from 'vega';
import {exporter} from '../../ctrl/export';
import {download, toBlob} from '../../util/io';
import {Icon} from '../Icon';

const assets = require('../../util/assets');

const RENDERER: { [s: string]: string } = {
  png: 'canvas',
  svg: 'svg'
};

export class Export extends React.Component {
  /**
   * Lyra's rendered visualization contains manipulators, so we re-render a
   * clean headless version to export as an image.
   * @param  {string} type Image format (png or svg).
   * @returns {void} File download of the png or svg image is triggered.
   */
  public toImageURL(type: string) {
    const spec = exporter();
    const view = new vg.View(vg.parse(spec), {renderer: RENDERER[type]});
    view.runAsync().then(() => view.toImageURL(type).then((url) => download(url, type)));
  }

  /**
   * Export and stringify the Vega specification for a file download.
   * @returns {void} File download of the JSON file is triggered.
   */
  public toJSONURL() {
    const spec = JSON.stringify(exporter(), null, 2);
    return toBlob(spec, 'json');
  }

  /**
   * Exports the specification and embeds it within the Vega HTML scaffolding.
   * @returns {void} File download of Vega HTML scaffolding,
   * with the spec embedded, is triggered.
   */
  public toHTMLURL() {
    const spec = JSON.stringify(exporter(), null, 2);
    const html = assets.scaffold.replace('INJECT_SPEC', spec);
    return toBlob(html, 'html');
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
