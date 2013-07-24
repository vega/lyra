vde.Vis.transforms.Formula = (function() {
  var formula = function() { 
    vde.Vis.Transform.call(this, 'formula', ['expr', 'field']);
    return this;
  }

  formula.prototype = new vde.Vis.Transform();
  var prototype = formula.prototype;

  prototype.spec = function() {
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