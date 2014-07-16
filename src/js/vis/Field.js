vde.Vis.Field = (function() {
  var field = function(name, accessor, type, pipelineName, stat) {
    if(typeof arguments[0] === 'object') {
      var f = arguments[0]; name = f.name;
      accessor = f.accessor; type = f.type;
      pipelineName = f.pipelineName; stat = f.stat;
    }

    this.name = name.replace('data.', '');
    this.accessor = accessor || '';
    this.type = type;
    this.pipelineName = pipelineName;

    this.stat = stat;

    return this;
  };

  field.prototype.spec = function() {
    return this.stat ? 'stats.' + this.stat + '_' + this.name:
      this.accessor + this.name;
  };

  field.prototype.pipeline = function() {
    return vde.Vis.pipelines[this.pipelineName];
  };

  field.prototype.raw = function() {
    return this.accessor.indexOf('data') != -1 && !this.stat;
  };

  return field;
})();
