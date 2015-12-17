var dl = require('datalib'),
    NS = 'lyra_';

function ns(name) { return name.startsWith(NS) ? name : NS+name; }

module.exports = {
  ns: ns,

  propSg: function(mark, p) {
    return ns(mark.name+'_'+p);
  },

  // Returns an expr str condition that tests whether the anchor target
  // has a particular key or is a scenegraph item itself.
  anchorTarget: function(mark, key) {
    var sg = require('./model/signals'),
        ANCHOR = sg.ANCHOR, TARGET = ANCHOR+'.target';
        
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