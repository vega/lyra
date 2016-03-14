'use strict';
var dl = require('datalib'),
    vg = require('vega'),
    ns = require('../util/ns'),
    t = module.exports = {},
    MANIPULATORS = ns('manipulators_');

t[MANIPULATORS + 'rect'] = require('./manipulators/Rect');
t[MANIPULATORS + 'group'] = require('./manipulators/Rect');
t[MANIPULATORS + 'symbol'] = require('./manipulators/Symbol');
t[MANIPULATORS + 'line'] = require('./manipulators/Line');
t[MANIPULATORS + 'text'] = require('./manipulators/Text');
t[MANIPULATORS + 'area'] = require('./manipulators/Area');


t[ns('bubble_cursor')] = require('./BubbleCursor');

dl.extend(vg.transforms, t);
