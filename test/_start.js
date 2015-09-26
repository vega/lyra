var chai  = require('chai'),
    spies = require('chai-spies'),
    fs = require('fs'),
    res = './test/resources/';

global.chai   = chai.use(spies);
global.expect = chai.expect;

global.lyraPath = '../src/js/';
global.lyra = require('../src/js');
global.Vis  = require('../src/js/vis/Visualization');

global.load = function(name) {
  return fs.readFileSync(res + name + '.png');
};

global.image = function(name) {
  var img = lyra.view.renderer()
    .canvas()
    .toBuffer();

  if (global.image.save) {
    fs.writeFileSync(res + name + '.png', img);
  }

  return img;
};
global.image.save = false;
