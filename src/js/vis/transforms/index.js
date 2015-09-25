var dl = require('datalib'),
    vg = require('vega'),
    t = module.exports = {};

var MANIPULATORS = 'lyra_manipulators_';

t[MANIPULATORS + 'rect']  = require('./manipulators/Rect');
t[MANIPULATORS + 'group'] = require('./manipulators/Rect');
dl.extend(vg.transforms, t);