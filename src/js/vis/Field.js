vde.Vis.Field = (function() {
  var field = function(name, raw, type, pipelineName) {
    this.name = name.replace('data.', '');
    this.raw = (raw || name.indexOf('data.') != -1);
    this.type = type;
    this.pipelineName = pipelineName;

    return this;
  };

  field.prototype.spec = function() {
    return (this.raw ? 'data.' : '') + this.name;
  };

  return field;
})();