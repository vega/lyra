vde.Vis.transforms.Sort = (function() {
  var sort = function() { 
    vde.Vis.Transform.call(this, 'sort', ['by', 'order']);
    return this;
  }

  sort.prototype = new vde.Vis.Transform();

  sort.spec = function() {
    return {
      type: this.type,
      by: (this.properties.order == 'Descending' ? '-' : '') + 'data.' + this.properties.by
    };
  }

  return sort;
})();