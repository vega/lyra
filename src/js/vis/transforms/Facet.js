vde.Vis.transforms.Facet = (function() {
  var facet = function(pipelineName) {
    vde.Vis.Transform.call(this, pipelineName, 'facet', ['keys', 'sort']);

    // Because facets perform structural transformations, fork
    // whatever pipeline this is assigned to.
    this.forkPipeline = true;

    // When the facet transform is applied to marks, hook into
    // the spec generation and inject a new group that inherits
    // the pipeline, and rearrange scales, axes, marks.
    this._group = {
      type: "group",
      from:{},
      scales: [],
      axes: [],
      marks: [],
      properties: {}
    };

    this._seen = {scales: {}, axes: {}, marks: {}};
    this._transforms = [];

    vde.Vis.callback.register('pipeline.post_spec', this, this.pipelinePostSpec);
    vde.Vis.callback.register('mark.post_spec',  this, this.markPostSpec);
    vde.Vis.callback.register('axis.post_spec',  this, this.axisPostSpec);
    vde.Vis.callback.register('group.post_spec', this, this.groupPostSpec);

    return this;
  };

  facet.prototype = new vde.Vis.Transform();
  var prototype = facet.prototype;

  prototype.destroy = function() {
    vde.Vis.callback.deregister('pipeline.post_spec',  this);
    vde.Vis.callback.deregister('mark.post_spec',  this);
    vde.Vis.callback.deregister('axis.post_spec',  this);
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

  prototype.pipelinePostSpec = function(opts) {
    // Grab the transforms that must work within each facet, and them to our group
    var self = this, spec = opts.spec[opts.spec.length-1];
    this._transforms = [];

    // spec.transform.forEach(function(t, i) {
      // if(t.type == 'facet' || t.type == 'stats') return;
      // self._transforms.push(t);
      // spec.transform.splice(i, 1);
    // });
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
    spec.from.transform || (spec.from.transform = []);
    if(this._transforms.length > 0)
      spec.from.transform = spec.from.transform.concat(this._transforms);
    if(opts.item.oncePerFork) {
      spec.from.transform.push({
        type: 'filter',
        test: 'index == 0'
      });
    }

    this._group.marks.unshift(spec);
    this._seen.marks[opts.item.name] = 1;

    // Clear the spec because we'll inject it in later
    delete opts.spec.name;
    delete opts.spec.properties;
  };

  prototype.axisPostSpec = function(opts) {
    if(!this.pipeline() || !this.pipeline().forkName) return;
    if(!this.properties.keys) return;
    if(!opts.item.pipeline() ||
      (opts.item.pipeline() && opts.item.pipeline().name != this.pipeline().name)) return;
    if(this._seen.axes[opts.item.name]) return;
    if(this._posAxis && opts.item == this._posAxis) return;

    var spec = vg.duplicate(opts.spec);
    if(!opts.item.onceAcrossForks) {
      this._group.axes.push(spec);

      delete opts.spec.name;
      delete opts.spec.scale;
    }

    this._seen.axes[opts.item.name] = 1;
  };

  prototype.groupPostSpec = function(opts) {
    var self = this,
        emptyInjection = this._group.scales.length == 0 &&
          this._group.axes.length == 0 && this._group.marks.length == 0;

    if(!this.pipeline() || !this.pipeline().forkName) return;
    if(!this.properties.keys) return;
    if(emptyInjection && opts.item.pipeline() != this.pipeline()) return;

    var layout = (this.properties.layout && this.properties.layout != 'Overlap');

    // Add a scale to position the facets
    if(layout) {
      var isHoriz = this.properties.layout == 'Horizontal';
      if(!this._posScale) {
        this._posScale = this.pipeline().scale({
          domainTypes: {from: 'field'},
          domainField: new vde.Vis.Field('key', '', 'ordinal', this.pipeline().forkName),
          rangeTypes: {type: 'spatial', from: 'field'}
        }, {
          properties: {type: 'ordinal', padding: 0.2}
        }, 'groups');
      }

      this._posScale.properties.type = 'ordinal';
      this._posScale.domainField = new vde.Vis.Field('key', '', 'ordinal', this.pipeline().forkName);
      this._posScale.rangeField = new vde.Vis.Field(isHoriz ? 'width' : 'height');
      this._posScale.properties.points = false;
      this._posScale.used = true;

      if(!this._posAxis) {
        this._posAxis = new vde.Vis.Axis('groups_axis', opts.item.name);
        var ap = this._posAxis.properties;
        ap.type = isHoriz? 'x' : 'y';
        ap.orient = isHoriz ? 'top' : 'right';
        this._posAxis.bindProperty('scale', {pipelineName: this.pipelineName, scaleName: this._posScale.name});
        opts.spec.axes.push(this._posAxis.spec());
      }
    }

    if(emptyInjection) {  // Facet was applied on the group directly

    } else {              // Facet was applied on marks, so inject a group
      this._group.name = opts.item.name + '_facet';
      this._group.from.data = this.pipeline().forkName;

      if(layout) {
        opts.spec.scales || (opts.spec.scales = []);
        opts.spec.scales.forEach(function(scale) {
          if(scale.name == self._posScale.name) return;

          var s = vg.duplicate(scale);
          if(scale.domain.data == self.pipelineName) delete s.domain.data;

          // Shadow this scale if it uses group width/height and we're laying out _groups
          var shadowScale = (scale.shadowInGroup || (self.properties.layout == 'Horizontal' && scale.range == 'width') ||
              (self.properties.layout == 'Vertical' && scale.range == 'height'));

          if(shadowScale) self._group.scales.push(s);
        });

        opts.spec.scales.push(this._posScale.spec());

        var pos =  {scale: this._posScale.name, field: 'key'};
        var size = {scale: this._posScale.name, band: true};
        var enter = opts.spec.properties.enter;

        this._group.properties.enter = isHoriz ?
          {x: pos, width: size,  y: enter.y, height: enter.height} :
          {y: pos, height: size, x: enter.x, width: enter.width};
      } else {
        this._group.properties = vg.duplicate(opts.spec.properties);
        opts.spec.from = {};
        vg.keys(opts.spec.properties.enter).forEach(function(k) {
          var p = opts.spec.properties.enter[k];
          if(p.scale || p.field) opts.spec.properties.enter[k] = {value: vde.Vis.properties[k]};
        });
        opts.spec.properties.enter.clip = {value: 0};
      }

      opts.spec.marks.push(vg.duplicate(this._group));
    }

    // Clear it for the next pass
    this._group.properties = {};
    this._group.scales = [];
    this._group.axes = [];
    this._group.marks = [];
    this._seen = {scales: {}, axes: {}, marks: {}};
  };

  return facet;
})();
