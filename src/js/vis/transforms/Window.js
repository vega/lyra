vde.Vis.transforms.Window = (function() {
  var win = function(pipelineName) {
    vde.Vis.Transform.call(this, pipelineName, 'window', 'Window', ['size', 'step']);

    this.requiresFork = true;

    vde.Vis.callback.register('injection.post_spec', this, this.injectionPostSpec);

    return this;
  }

  win.prototype = new vde.Vis.Transform();
  var prototype = win.prototype;

  prototype.destroy = function() {
    vde.Vis.callback.deregister('injection.post_spec',  this);
  };

  prototype.spec = function() { return null; };

  // TODO: Holy hack Batman. Fix this Post-CHI.
  prototype.injectionPostSpec = function(opts) {
    if(!this.properties.size || !this.properties.step) return;
    if(opts.item.pipelineName != this.pipelineName) return;

    var wGrp = {
      type: 'group',
      name: opts.group.name + '_window',
      from: {
        transform: [{
          type: 'window',
          size: this.properties.size,
          step: this.properties.step
        }]
      },
      marks: vg.duplicate(opts.group.marks)
    };

    opts.group.marks = [wGrp];
  };

  return win;
})();
