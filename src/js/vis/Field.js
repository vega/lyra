vde.Vis.Field = (function() {
  var field = function(name, raw) {
    this.name = name.replace('data.', '');
    this.raw = (raw || name.indexOf('data.') != -1);
    this.pipelineName = null;

    return this;
  };

  field.prototype.spec = function() {
    return (this.raw ? 'data.' : '') + this.name;
  };

  return field;
})();