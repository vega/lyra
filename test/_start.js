var chai  = require('chai'),
    spies = require('chai-spies');

global.chai   = chai.use(spies);
global.expect = chai.expect;

global.lyraPath = '../src/js/';
global.lyra = require('../src/js');
