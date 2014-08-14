var jsonpath = require('JSONPath');

exports.dragAndDrop = function(elem, to) {
  to.getLocation().then(function(tLoc) {
    elem.getLocation().then(function(eLoc) {
      browser.actions().dragAndDrop(elem, {x: tLoc.x - eLoc.x, y: tLoc.y - eLoc.y }).perform();
    })
  });
};

var util = require("util")

exports.checkSpec = function(conds) {
  browser.executeAsyncScript(function(cb){
    vde.Vis.render(false).then(cb);
  }).then(function(spec) {
    conds.forEach(function(c) {
      expect(jsonpath.eval(spec, c.path)[0]).toEqual(c.equal);
    });
  });
};