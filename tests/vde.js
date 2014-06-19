var jsonpath = require('JSONPath');

exports.dragAndDrop = function(elem, to) {
  var e = elem.find();
  to.getLocation().then(function(tLoc) {
    e.getLocation().then(function(eLoc) {
      browser.actions().dragAndDrop(e, {x: tLoc.x - eLoc.x, y: tLoc.y - eLoc.y }).perform();
    })
  });
};

exports.checkSpec = function(conds) {
  browser.executeScript('return vde.Vis.parse(false)').then(function(spec) {
    conds.forEach(function(c) {
      expect(jsonpath.eval(spec, c.path)[0]).toEqual(c.equal);
    });
  });
};