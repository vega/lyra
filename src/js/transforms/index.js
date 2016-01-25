var dl = require('datalib'),
    vg = require('vega'),
    util = require('../util'),
    t = module.exports = {};

var MANIPULATORS = util.ns('manipulators_');
t[MANIPULATORS + 'rect']  = require('./manipulators/Rect');
t[MANIPULATORS + 'group'] = require('./manipulators/Rect');
t[MANIPULATORS + 'symbol'] = require('./manipulators/Symbol');

t[util.ns('dropzone')] = require('./DropZone');

dl.extend(vg.transforms, t);