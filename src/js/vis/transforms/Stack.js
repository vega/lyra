vde.Vis.transforms.Stack = (function() {
  var stack = function() { 
    vde.Vis.Transform.call(this, 'stack', ['point', 'height']);

    vde.Vis.callback.register('vis.post_spec', this, this.visPostSpec);

    this.scale = null;
    this.requiresFork = true;
    this.isVisual = true;

    return this;
  }

  stack.prototype = new vde.Vis.Transform();
  var prototype = stack.prototype;

  prototype.destroy = function() {
    vde.Vis.callback.deregister('vis.post_spec', this);
  };

  prototype.spec = function() {
    if(!this.pipeline()) return;
    if(!this.properties.point || !this.properties.height) return;

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
    if(!this.pipeline()) return;

    if(!this.pipeline().forkName) {
      var t = this.pipeline().transforms, thisIdx = null;
      for(var i = 0; i < t.length; i++) {
        if(t[i] == this) { thisIdx = i; break; }
      }

      var facet = new vde.Vis.transforms.Facet();
      facet.pipelineName = this.pipelineName;
      this.pipeline().transforms.splice(thisIdx, 0, facet);

      vde.Vis.parse();
    }

    if(!this.properties.point || !this.properties.height) return;

    opts.spec.data.push({
      name: this.pipeline().name + '_stack',
      source: this.pipeline().source,
      transform: [
        {type: 'facet', keys: [this.properties.point.spec()]},
        {type: 'stats', value: this.properties.height.spec()}
      ]
    });
  };

  return stack;
})();