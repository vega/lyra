// no longer being used once Karma is set up
var expect = require('chai').expect,
    sinon = require('sinon'),
    fs = require('fs'),
    res = './test/resources/';


// global.src = '../src/js/';
// global.model = require('../src/js/model/index.js');

// global.load = function(name) {
//   return fs.readFileSync(res + name + '.png');
// };

// global.image = function(name) {
//   var img = model.view.renderer()
//     .canvas()
//     .toBuffer();

//   if (global.image.save) {
//     fs.writeFileSync(res + name + '.png', img);
//   }

//   return img;
// };
// global.image.save = false;

// // // Load cars dataset for testing

// before(function() {
//   var cars = global.cars = model.pipeline('cars');
//   cars._source.init({
//     values: JSON.parse(fs.readFileSync('./resources/cars.json'))
//   });
//   cars.f = function(name) { return cars._source.schema()[name]._id; };
// });

// // Start each test with a fresh model/vis.
// beforeEach(function() {
//   model = model.init();
// });
