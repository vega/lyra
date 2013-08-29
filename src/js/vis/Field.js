vde.Vis.Field = (function() {
  var field = function(name, raw, type, pipelineName, geo) {
    this.name = name.replace('data.', '');
    this.raw = (raw || name.indexOf('data.') != -1);
    this.type = type;
    this.pipelineName = pipelineName;

    this.geo = geo || false; // A flag to prevent default scales

    return this;
  };

  field.prototype.spec = function() {
    return (this.raw ? 'data.' : '') + this.name;
  };

  return field;
})();
