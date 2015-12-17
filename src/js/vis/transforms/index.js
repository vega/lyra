var dl = require('datalib'),
    vg = require('vega'),
    sg = require('../../model/signals'),
    t = module.exports = {};

var MANIPULATORS = sg.ns('manipulators_');
t[MANIPULATORS + 'rect']  = require('./manipulators/Rect');
t[MANIPULATORS + 'group'] = require('./manipulators/Rect');

t[sg.ns('dropzone')] = require('./DropZone');

dl.extend(vg.transforms, t);