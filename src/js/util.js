'use strict';
var dl = require('datalib'),
    vg = require('vega'),
    NS = 'lyra_',
    vgSchema;

function ns (name) {
  return name.startsWith(NS) ? name : NS+name;
};

/** @namespace */
var util = {
/**
 * ns
 * add description
 * @param {string} name - todo.
 */
  ns: ns,

/**
 * Util#propSq
 * add description
 * @param {string} mark - todo.
 * @param {string} p - todo.
 */
  propSg: function(mark, p) {
    return ns(mark.type + '_' + mark._id + '_' + p);
  },

/**
 * Util#anchorTarget
 * Returns an expr str condition that tests whether the anchor target
 * has a particular key or is a scenegraph item itself.
 * @constructor
 * @param {string} mark - todo.
 * @param {string} mode - todo.
 * @param {string} key - todo.
 */
  anchorTarget: function(mark, mode, key) {
    var sg = require('./model/signals'),
        ANCHOR = sg.ANCHOR, TARGET = ANCHOR + '.target',
        c = '(' + ANCHOR + '&&' + TARGET + '&&' + TARGET + '.datum &&';

    if (key) {  // Manipulator
      c += TARGET + '.datum.mode === ' + dl.str(mode) + ' &&' +
        TARGET + '.datum.lyra_id === ' + dl.str(mark._id) + '&&' +
        'test(regexp(' + dl.str(key) + ', "i"), ' + TARGET + '.datum.key)';
    }
    else {  // Mark
      c += TARGET + '.mark && ' + TARGET + '.mark.name === ' + dl.str(mark.name);
    }
    return c + ')';
  },

/**
 * Util#test
 * Returns ...
 * @param {string} condition - todo.
 * @param {string} t - todo.
 * @param {string} f - todo.
 */
  test: function(cond, t, f) {
    return 'if(' + cond + ',' + t + ',' + f + ')';
  },

/**
 * Util#schema
 * Returns vega-schema
 */
  schema: function() {
    return vgSchema || (vgSchema = vg.schema({
      url: 'http://vega.github.io/vega/vega-schema.json'
    }));
  }
};

module.exports = util;
