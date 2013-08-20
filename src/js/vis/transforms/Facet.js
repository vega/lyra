vde.Vis.transforms.Facet = (function() {
  var facet = function() { 
    vde.Vis.Transform.call(this, 'facet', ['keys', 'sort']);

    // Because facets perform structural transformations, fork
    // whatever pipeline this is assigned to. 
    this.forkPipeline = true;

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

    this._seen = {scales: {}, axes: {}, marks: {}};

    vde.Vis.callback.register('mark.post_spec',  this, this.markPostSpec);
    // vde.Vis.callback.register('scale.post_spec', this, this.scalePostSpec);
    vde.Vis.callback.register('group.post_spec', this, this.groupPostSpec);

    return this;
  };

  facet.prototype = new vde.Vis.Transform();
  var prototype = facet.prototype;

  prototype.destroy = function() {
    vde.Vis.callback.deregister('mark.post_spec',  this);
    // vde.Vis.callback.deregister('scale.post_spec', this);
    vde.Vis.callback.deregister('group.post_spec', this);

    if(this.pipeline()) {
      this.pipeline().forkName = null;
      this.pipeline().forkIdx  = null;
    }
  };

  prototype.spec = function() {
    var spec = {type: 'facet'};
    if(this.properties.keys) spec.keys = [this.properties.keys.spec()];

    return spec;
  };

  prototype.markPostSpec = function(opts) {
    if(!this.pipeline() || !this.pipeline().forkName) return;
    if(!this.properties.keys) return;
    if(opts.item.type == 'group')  return;
    if(!opts.item.pipeline() || 
      (opts.item.pipeline() && opts.item.pipeline().name != this.pipeline().name)) return;
    if(this._seen.marks[opts.item.name]) return;

    var spec = vg.duplicate(opts.spec);
    delete spec.from.data;   // Inherit from the group
    if(opts.item.oncePerFork) {
      spec.from.transform || (spec.from.transform = [])
      spec.from.transform.push({
        type: 'filter',
        test: 'index == 0'
      });
    }

    this._group.marks.push(spec);
    this._seen.marks[opts.item.name] = 1;

    // Clear the spec because we'll inject it in later
    delete opts.spec.name;
    delete opts.spec.properties;
  };

  prototype.scalePostSpec = function(opts) {
    if(!this.pipeline() || !this.pipeline().forkName) return;
    if(!this.properties.keys) return;
    if(!opts.item.pipeline() || 
      (opts.item.pipeline() && opts.item.pipeline().name != this.pipeline().name)) return;
    if(this._seen.scales[opts.item.name]) return;

    // Shadow this scale if it uses group width/height and we're laying out _groups
    if((this.properties.layout == 'Horizontal' && opts.spec.range == 'width') || 
       (this.properties.layout == 'Vertical' && opts.spec.range == 'height'))
          this._group.scales.push(vg.duplicate(opts.spec));

    this._seen.scales[opts.item.name] = 1;
  };

  prototype.groupPostSpec = function(opts) {
    if(!this.pipeline() || !this.pipeline().forkName) return;
    if(!this.properties.keys) return;
    if(this._group.scales.length == 0 && this._group.axes.length == 0 &&
        this._group.marks.length == 0) return;

    var self = this, key = this.properties.keys.spec();

    this._group.name = opts.item.name + '_facet';
    this._group.from = {data: this.pipeline().forkName};

    // Inject spec to position groups
    if(this.properties.layout != 'Overlap') {
      var posScale = this.pipeline().name + '_pos';
      var isHoriz  = this.properties.layout == 'Horizontal';
      var posScale = this.pipeline().scale({
        type: 'ordinal',
        padding: 0.2,
        field: this.properties.keys,
        range: new vde.Vis.Field(isHoriz ? 'width' : 'height')
      }, {}, 'facets');
      posScale.properties.points = false;

      opts.spec.scales || (opts.spec.scales = []);
      opts.spec.scales.forEach(function(scale) {
        // Shadow this scale if it uses group width/height and we're laying out _groups
        if((self.properties.layout == 'Horizontal' && scale.range == 'width') || 
           (self.properties.layout == 'Vertical' && scale.range == 'height'))
              self._group.scales.push(vg.duplicate(scale));        
      });

      opts.spec.scales.push(posScale.spec());

      var pos =  {scale: posScale.name, field: 'key'};
      var size = {scale: posScale.name, band: true};

      this._group.properties.enter = isHoriz ? 
        {x: pos, width: size} : {y: pos, height: size};
    }

    opts.spec.marks.push(vg.duplicate(this._group));

    // Clear it for the next pass
    this._group.properties = {};
    this._group.scales = [];
    this._group.axes = [];      
    this._group.marks = [];
    this._seen = {scales: {}, axes: {}, marks: {}};
  };

  return facet;
})();