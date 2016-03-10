'use strict';
var dl = require('datalib'),
    vg = require('vega'),
    util = require('../util'),
    t = module.exports = {},
    MANIPULATORS = util.ns('manipulators_');

t[MANIPULATORS + 'rect'] = require('./manipulators/Rect');
t[MANIPULATORS + 'group'] = require('./manipulators/Rect');
t[MANIPULATORS + 'symbol'] = require('./manipulators/Symbol');
t[MANIPULATORS + 'line'] = require('./manipulators/Line');
t[MANIPULATORS + 'text'] = require('./manipulators/Text');

t[util.ns('bubble_cursor')] = require('./BubbleCursor');

dl.extend(vg.transforms, t);
