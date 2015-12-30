#!/usr/bin/env node

var fs = require('fs'),
    mkdirp = require('mkdirp'),
    lib = './vendor/lib/',
    env = process.env.NODE_ENV,
    dist = env === 'production' ? '.min.js' : '.js';

function copy(src, dest) {
  fs.createReadStream('./node_modules/'+src+dist)
    .pipe(fs.createWriteStream(lib+dest+'.min.js'));
}

// Make vendor + lib directories.
mkdirp(lib, function(err) {
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



