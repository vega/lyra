vde.Vis.transforms.Filter = (function() {
  var filter = function(pipelineName) {
    vde.Vis.Transform.call(this, pipelineName, 'filter', 'Filter', ['test']);

    this.exprFields = [];

    return this;
  };

  filter.prototype = new vde.Vis.Transform();
  var prototype = filter.prototype;

  prototype.spec = function() {
    return {
      type: this.type,
      test: this.properties.test
    };
  };

  prototype.onFork = function() { return false; };

  return filter;
})();
