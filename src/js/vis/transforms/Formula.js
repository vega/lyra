vde.Vis.transforms.Formula = (function() {
  var formula = function(pipelineName) {
    vde.Vis.Transform.call(this, pipelineName, 'formula', 'Formula', ['expr', 'field']);

    this.exprFields = [];
    this.output = {
      field: null
    };

    return this;
  };

  formula.prototype = new vde.Vis.Transform();
  var prototype = formula.prototype;

  prototype.spec = function() {
    this.output.field = new vde.Vis.Field(this.properties.field, '', 'ordinal', this.pipelineName);

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

  prototype.onFork = function() { return false; };

  return formula;
})();
