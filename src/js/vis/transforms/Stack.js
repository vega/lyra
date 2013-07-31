vde.Vis.transforms.Stack = (function() {
  var stack = function() { 
    vde.Vis.Transform.call(this, 'stack', ['point', 'height']);

    vde.Vis.Callback.register('vis.post_spec', this, this.visPostSpec);

    this.scale = null;
    this.requiresFork = true;

    return this;
  }

  stack.prototype = new vde.Vis.Transform();
  var prototype = stack.prototype;

  prototype.destroy = function() {
    vde.Vis.Callback.deregister('vis.post_spec', this);
  };

  prototype.spec = function() {
    // Add a scale for the stacking
    this.scale = this.pipeline().scale({
      field: new vde.Vis.Field('sum', false, 'linear', this.pipeline().name + '_stack')
    }, {
      type: 'linear', 
      range: new vde.Vis.Field('height')
    }, 'stacks');

    return {
      type: this.type,
      point: this.properties.point.spec(),
      height: this.properties.height.spec()
    };
  };

  // Inject stats calculation for height scales
  prototype.visPostSpec = function(opts) {
    var self = this;
    opts.spec.data.push({
      name: self.pipeline.name + '_stack',
      source: self.pipeline.source,
      transform: [
        {type: 'facet', keys: [self.properties.point.spec()]},
        {type: 'stats', value: self.properties.height.spec()}
      ]
    });
  };

  return stack;
})();