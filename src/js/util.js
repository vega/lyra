var dl = require('datalib'),
    sg = require('./state/signals');

var ANCHOR = sg.ANCHOR, TARGET = ANCHOR+'.target';

module.exports = {
  propSg: function(mark, p) {
    return sg.ns(mark.name+'_'+p);
  },

  // Returns an expr str condition that tests whether the anchor target
  // has a particular key or is a scenegraph item itself.
  anchorTarget: function(mark, key) {
    var c = '(' + ANCHOR + '&&' + TARGET + '&&' + TARGET+'.datum &&';
    if (key) {  // Manipulator
      c += TARGET + '.datum.kind === "handles" &&' +
        TARGET + '.datum.name === ' + dl.str(mark.name) + '&&' +
        'test(regexp('+ dl.str(key) + ', "i"), ' + TARGET + '.datum.key)';
    } else {  // Mark
      c += TARGET+ '.mark && ' + TARGET + '.mark.name === ' + dl.str(mark.name);
    }
    return c+')';
  },

  test: function(cond, t, f) {
    return 'if('+cond+','+t+','+f+')';
  }
};