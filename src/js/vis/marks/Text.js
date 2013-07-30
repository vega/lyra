vde.Vis.marks.Text = (function() {
  var text = function(name, group) {
    vde.Vis.Mark.call(this, name);

    this.type = 'text';
    this.group = group;

    this.properties = {
      x: {value: 0},
      y: {value: 0},

      text: {value: 'Hello World'},
      align: {value: 'left'},
      baseline: {value: 'bottom'},
      dx: {value: 0},
      dy: {value: 0},
      angle: {value: 0},
      font: {value: 'Helvetica'},
      fontSize: {value: 12},
      fontWeight: {value: 'normal'},
      fontStyle: {value: 'normal'},

      fill: {value: '#4682b4'},
    };

    return this.init();
  };

  text.prototype = new vde.Vis.Mark();
  var prototype  = text.prototype;

  prototype.productionRules = function(prop, scale, field) {
    switch(prop) {
      case 'text':
        scale = null;
      break;
    }

    return [scale, field];
  };

  prototype.checkExtents = function(prop) {
    var p = this.properties;

    if(p.align.value == 'center') p.dx.disabled = true;
    else delete p.dx.disabled;

    if(p.baseline.value == 'middle') p.dy.disabled = true;
    else delete p.dy.disabled;
  };

  return text;
})();