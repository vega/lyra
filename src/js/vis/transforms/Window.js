vde.Vis.transforms.Window = (function() {
  var win = function(pipelineName) {
    vde.Vis.Transform.call(this, pipelineName, 'window', 'Window', ['size', 'step']);

    this.requiresFork = true;

    vde.Vis.callback.register('group.post_spec', this, this.groupPostSpec);

    return this;
  }

  win.prototype = new vde.Vis.Transform();
  var prototype = win.prototype;

  prototype.destroy = function() {
    vde.Vis.callback.deregister('group.post_spec',  this);
  };

  prototype.spec = function() { return null; };

  prototype.groupPostSpec = function(opts) {
    if(!this.properties.size || !this.properties.step) return;
    if(opts.item.pipelineName != this.pipelineName) return;
    if(opts.item.isLayer()) return;

    var marks = vg.duplicate(opts.spec.marks);

    opts.spec.marks = [{
      type: 'group',
      name: opts.item.name + '_window',
      from: {
        transform: [{
          type: 'window',
          size: this.properties.size,
          step: this.properties.step
        }]
      },
      marks: marks
    }];
  };

  return win;
})();
