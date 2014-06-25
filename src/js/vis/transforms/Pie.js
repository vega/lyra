vde.Vis.transforms.Pie = (function() {
  var pie = function(pipelineName) {
    vde.Vis.Transform.call(this, pipelineName, 'pie', 'Pie Chart', ['value', 'sort']);

    this.isVisual = true;

    this.output = {
      startAngle: new vde.Vis.Field('startAngle', '', 'encoded', pipelineName),
      endAngle: new vde.Vis.Field('endAngle', '', 'encoded', pipelineName)
    };

    return this;
  };

  pie.prototype = new vde.Vis.Transform();
  var prototype = pie.prototype;

  prototype.spec = function() {
    var spec = {
      type: this.type,
      sort: this.properties.sort
    };

    if(this.properties.value)
      spec.value = this.properties.value.spec();

    return spec;
  };

  prototype.unbindProperty = function(prop) {
    delete this.properties[prop];
  };

  return pie;
})();
