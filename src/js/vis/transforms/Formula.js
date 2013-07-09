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
  }

  return formula;
})();