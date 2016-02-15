#!/usr/bin/env node

var fs = require('fs'),
    mkdirp = require('mkdirp'),
    env = process.env.NODE_ENV,
    dist = env === 'production' ? '.min.js' : '.js';

var VENDOR = './vendor/',
    LIB = VENDOR+'lib/',
    JS  = VENDOR+'js/',
    CSS = VENDOR+'css/';

function copy(src, dest) {
  fs.createReadStream('./node_modules/'+src+dist)
    .pipe(fs.createWriteStream(LIB+dest+'.min.js'));
}

// Make vendor + lib directories.
mkdirp(LIB, function(err) {
  if (err) return console.error(err);

  // Copy shimmed dependencies. If we're in production, use
  // minified versions. Otherwise, use the full versions.
  // In development, this gets us sourcemaps for Vega and warnings
  // for React.

  copy('d3/d3', 'd3');
  copy('vega/vega', 'vega');
  copy('vega-lite/vega-lite', 'vega-lite');
  copy('react/dist/react', 'react');
  copy('react-dom/dist/react-dom', 'react-dom');
});

mkdirp(JS);
mkdirp(CSS);



