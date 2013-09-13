vde.Vis.transforms.Formula = (function() {
  var formula = function(pipelineName) {
    vde.Vis.Transform.call(this, pipelineName, 'formula', ['expr', 'field']);

    this.exprFields = [];

    return this;
  }

  formula.prototype = new vde.Vis.Transform();
  var prototype = formula.prototype;

  prototype.spec = function() {
    // To add aggregates to pipeline
    this.exprFields.forEach(function(f) { f.spec(); });

    return {
      type: this.type,
      field: this.properties.field,
      expr: this.properties.expr
    };
  };

  prototype.bindProperty = function(prop, opts) {
    vde.Vis.Transform.prototype.bindProperty.call(this, prop, opts);
    this.output = [this.properties.field];
  };

  return formula;
})();
