vde.Vis.transforms.Filter = (function() {
  var filter = function(pipelineName) {
    vde.Vis.Transform.call(this, pipelineName, 'filter', ['test']);

    this.exprFields = [];

    return this;
  }

  filter.prototype = new vde.Vis.Transform();
  var prototype = filter.prototype;

  prototype.spec = function() {
    // To add aggregates to pipeline
    this.exprFields.forEach(function(f) { f.spec(); });

    return {
      type: this.type,
      test: this.properties.test
    };
  }

  return filter;
})();
