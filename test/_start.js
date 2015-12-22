var chai  = require('chai'),
    spies = require('chai-spies'),
    fs = require('fs'),
    res = './test/resources/';

global.chai   = chai.use(spies);
global.expect = chai.expect;

global.src = '../src/js/';
global.model = require(src);

global.load = function(name) {
  return fs.readFileSync(res + name + '.png');
};

global.image = function(name) {
  var img = model.view.renderer()
    .canvas()
    .toBuffer();

  if (global.image.save) {
    fs.writeFileSync(res + name + '.png', img);
  }

  return img;
};
global.image.save = false;

// Load cars dataset for testing

before(function() {
  var cars = global.cars = model.pipeline('cars');
  cars._source.init({ 
    values: JSON.parse(fs.readFileSync(res + 'cars.json')) 
  });
  cars.f = function(name) { return cars._source.schema()[name]._id; };
});

// Start each test with a fresh model/vis.
beforeEach(function() {
  model = model.init();
});