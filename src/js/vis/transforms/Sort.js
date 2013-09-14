vde.Vis.transforms.Sort = (function() {
  var sort = function(pipelineName) {
    vde.Vis.Transform.call(this, pipelineName, 'sort', ['by', 'order']);
    return this;
  }

  sort.prototype = new vde.Vis.Transform();
  var prototype = sort.prototype;

  prototype.spec = function() {
    return {
      type: this.type,
      by: (this.properties.order == 'Descending' ? '-' : '') + this.properties.by.spec().replace('stats.', '')
    };
  }

  return sort;
})();
