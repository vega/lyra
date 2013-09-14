vde.Vis.transforms.Stats = (function() {
  var stats = function(pipelineName) {
    vde.Vis.Transform.call(this, pipelineName, 'stats', ['value', 'median']);

    this.requiresFork = true;

    return this;
  };

  stats.prototype = new vde.Vis.Transform();
  var prototype = stats.prototype;
  var fields = ["count", "min", "max", "sum", "mean", "variance", "stdev", "median"];

  prototype.spec = function() {
    var self = this, value = this.properties.value.split('.'),
        output = {};
    this.fields = [];

    fields.forEach(function(s) {
      output[s] = s+'_'+value[value.length-1];
      self.fields.push(output[s]);
    });

    return {
      type: 'stats',
      value: this.properties.value,
      median: this.properties.median,
      assign: true,
      output: output
    };
  };

  return stats;
})();
