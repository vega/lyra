vde.Vis.Field = (function() {
  var field = function(name, accessor, type, pipelineName) {
    this.name = name.replace('data.', '');
    this.accessor = accessor ? accessor+'.' : '';
    this.type = type;
    this.pipelineName = pipelineName;

    return this;
  };

  field.prototype.spec = function() {
    return this.accessor + this.name;
  };

  field.prototype.pipeline = function() {
    return vde.Vis.pipelines[this.pipelineName];
  };

  field.prototype.raw = function() {
    return this.accessor.indexOf('data') != -1;
  }

  return field;
})();
