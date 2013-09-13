vde.Vis.Field = (function() {
  var field = function(name, accessor, type, pipelineName) {
    this.name = name.replace('data.', '');
    this.accessor = accessor ? accessor+'.' : '';
    this.type = type;
    this.pipelineName = pipelineName;

    this.stat = null;

    return this;
  };

  field.prototype.spec = function() {
    this.aggregate(this.stat);
    return this.stat ? 'stats.' + this.stat + '(' + this.name + ')' :
      this.accessor + this.name;
  };

  field.prototype.pipeline = function() {
    return vde.Vis.pipelines[this.pipelineName];
  };

  field.prototype.raw = function() {
    return this.accessor.indexOf('data') != -1 && !this.stat;
  };

  field.prototype.aggregate = function(stat) {
    if(!stat) return;
    var a = this.pipeline().aggregate;
    this.stat = stat;
    if(a[this.accessor+this.name] != 'median')
      a[this.accessor+this.name] = stat;
  };

  return field;
})();
