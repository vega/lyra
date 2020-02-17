import {array} from 'vega';
const d3 = require('d3');
const dl = require('datalib');

const MIME: { [s: string]: string } = {
  json: 'application/json',
  html: 'text/html'
};

 /**
  * Constructs a Blob URL for the given data, and triggers a file download.
  * @param  {Object|string} data Data to construct a blob from.
  * @param  {string} type Data type (json or html).
  * @returns {void}
  */
export function toBlob(data: BlobPart, type: string) {
  const blob = new Blob([data], {type: MIME[type]});
  const url = window.URL.createObjectURL(blob);
  return download(url, type);
}

 /**
  * Triggers a file download from the given URL, and with the given extension.
  * @param  {string} url URL to download.
  * @param  {string} ext File extension (e.g., png, svg, json, html)
  * @returns {void}   File download is triggered.
  */
export function download(url: string, ext: string) {
  const el = d3.select(document.createElement('a'))
    .attr('href', url)
    .attr('target', '_blank')
    .attr('download', 'lyra.' + ext)
    .node();

  const evt = document.createEvent('MouseEvents');
  evt.initMouseEvent('click', true, true, document.defaultView,
    1, 0, 0, 0, 0, false, false, false, false, 0, null);
  el.dispatchEvent(evt);
}

export function get(url: string, cb: (str: string, err?: any) => void) {
  dl.load({url}, (err, data) => cb(data, err));
}

export function fopen(accept: string | string[], cb: (str: string, file?: any) => void) {
  const el = d3.select(document.createElement('input'))
    .attr('type', 'file')
    .attr('accept', array(accept).map(ext => `.${ext}`).join(','))
    .on('change', () => {
      return read(d3.event.target.files, cb);
    })
    .node()
    .click();
}

export function read(entries, cb: (str: string, file?: any) => void) {
  for (const entry of entries) {
    const reader = new FileReader();
    reader.onloadend = ((file) => {
      return (e) => {
        const res = e.target.result;
        cb(typeof res === 'string' ? res : Buffer.from(res).toString('utf-8'), file);
      }
    })(entry);
    reader.readAsText(entry);
  }
}
