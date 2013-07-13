vde.Vis.transforms.Pie = (function() {
  var pie = function() { 
    vde.Vis.Transform.call(this, 'pie', ['value', 'sort']);
    return this;
  }

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