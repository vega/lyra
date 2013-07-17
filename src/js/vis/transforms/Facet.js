vde.Vis.transforms.Facet = (function() {
  var facet = function() { 
    vde.Vis.Transform.call(this, 'facet', ['keys', 'sort']);

    // When the facet transform is applied to marks, hook into 
    // the spec generation and inject a new group that inherits
    // the pipeline, and rearrange scales, axes, marks. 
    this._group = {
      type: "group",
      scales: [],
      axes: [],
      marks: [],
      properties: {}
    };

    vde.Vis.Callback.register('mark.post_spec',  this, this.markPostSpec);
    // vde.Vis.Callback.register('scale.post_spec', this, this.scalePostSpec);
    vde.Vis.Callback.register('group.post_spec', this, this.groupPostSpec);

    return this;
  }

  facet.prototype = new vde.Vis.Transform();
  var prototype = facet.prototype;

  prototype.spec = function() {
    return; // We will inject this transform to _group rather than the pipeline.
  };

  prototype.markPostSpec = function(opts) {
    if(!this.pipeline) return;
    if(opts.item.type == 'group')  return;
    if(opts.item.pipeline && opts.item.pipeline.name != this.pipeline.name)  return;

    delete opts.spec.from.data;   // Inherit from the group
    this._group.marks.push(vg.duplicate(opts.spec));

    // Clear the spec because we'll inject it in later
    delete opts.spec.properties;
  };

  prototype.scalePostSpec = function(opts) {
    if(!this.pipeline) return;
    if(opts.item.pipeline && opts.item.pipeline.name != this.pipeline.name)  return;

    delete opts.spec.domain.data;   // Inherit from the group
    this._group.scales.push(vg.duplicate(opts.spec));

    // Clear the spec because we'll inject it in later
    opts.spec = {};
  };

  prototype.groupPostSpec = function(opts) {
    if(!this.pipeline) return;
    if(this._group.scales.length == 0 && this._group.axes.length == 0 &&
        this._group.marks.length == 0) return;

    var key = this.properties.keys.spec();

    this._group.from = {
      data: this.pipeline.name,
      transform: [{type: 'facet', keys: [key]}]
    };

    // Inject spec to position groups
    if(this.properties.layout != 'Overlap') {
      var posScale = this.pipeline.name + '_pos';
      var isHoriz  = this.properties.layout == 'Horizontal';

      opts.spec.scales || (opts.spec.scales = []);
      opts.spec.scales.push({
        name: posScale,
        type: 'ordinal',
        padding: 0.2,
        domain: {data: this.pipeline.name, field: key},
        range: isHoriz ? 'width' : 'height'
      });

      var pos = {scale: posScale, field: 'key'};
      var size = {scale: posScale, band: true};

      this._group.properties.enter = isHoriz ? 
        {x: pos, width: size} : {y: pos, height: size};
    }

    opts.spec.marks.push(vg.duplicate(this._group));

    // Clear it for the next pass
    this._group.scales = [];
    this._group.axes = [];      
    this._group.marks = [];
  };

  return facet;
})();