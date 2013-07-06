vde.Vis.transforms.Filter = (function() {
  var filter = function() { 
    vde.Vis.Transform.call(this, 'filter', ['test']);
    return this;
  }

  filter.prototype = new vde.Vis.Transform();
  var prototype = filter.prototype;

  prototype.spec = function() {
    return {
      type: this.type,
      test: this.properties.test
    };
  }

  return filter;
})();