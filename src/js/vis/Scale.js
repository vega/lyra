vde.Vis.Scale = (function() {
  var scale = function(name, pipeline, defaults, displayName) {
    var scaleName = 'scale_r' + Date.now();
    this.name  = (name || pipeline.name + '_' + scaleName);
    this.displayName = displayName;

    this.domainTypes = {from: 'values'};  // Field or Values
    this.rangeTypes  = {type: 'spatial', from: 'preset'};  // 'property' key if type is 'other'

    this.domainField = null;
    this.rangeField  = null;

    this.domainValues = [0, 100]; //set [0, 100] as default value - works for all of quantitative, ordinal, categorical
    this.rangeValues  = [];

    this.used = false;    // Auto-delete unused scales
    this.manual = false;  // Manually create scales should always stick around

    this.hasAxis  = false;  // Does this scale already have an axis/legend on the vis
    this.axisType = 'x';    // If not, visualize it on iVis when editing
    this.inheritFromGroup = false; // Drawn domain from group's dataset?

    this.properties = {
      type: 'linear',
      points: true,
      nice: true,
      // clamp: false
      padding: 0,
      // exponent: 0,
      zero: true
    };

    for(var d in defaults) {
      if(d == 'properties') continue;
      this[d] = defaults[d];
    }

    for(var d in defaults.properties) this.properties[d] = defaults.properties[d];

    this.pipelineName = pipeline.name;
    pipeline.scales[this.name] = this;

    return this;
  };

  var prototype = scale.prototype;

  prototype.spec = function() {
    var spec = vg.duplicate(this.properties);
    if(!this.pipeline()) return;

    vde.Vis.callback.run('scale.pre_spec', this, {spec: spec});

    spec.name = this.name;

    var field = this.domainField;
    spec.domain = (this.domainTypes.from == 'field' && field)
      ? { data:  field.stat ? field.pipeline().forkName : field.pipelineName,
          field: field.stat ? field.spec().replace('stats.','') : field.spec() }
      : this.domainValues;
    spec.inheritFromGroup = this.inheritFromGroup;  // Easiest way of picking this up in group injection

    spec.range = (this.rangeTypes.from == 'preset' && this.rangeField) ?
      this.rangeField.spec() : this.rangeValues;

    delete spec.pipeline;
    delete spec.field;
    if(spec.type == 'quantize') delete spec.nice;
    if(spec.type == 'time' && spec.nice === true) delete spec.nice;

    vde.Vis.callback.run('scale.post_spec', this, {spec: spec});

    return spec;
  };

  prototype.def = function() {
    // TODO

    return null;
  };

  prototype.type  = function() { return this.properties.type; };
  prototype.field = function() { return this.domainTypes.from == 'field' ? this.domainField : this.domainValues; };
  prototype.range = function() { return this.rangeTypes.from == 'preset'  ? this.rangeField  : this.rangeValues; };

  prototype.pipeline = function() {
    return vde.Vis.pipelines[this.pipelineName];
  };

  prototype.equals = function(b) {
    var a = {};
    var aFromB = function(a, b, self) {
      for(var k in b) {
        var isObj = vg.isObject(b[k]) &&
          !vg.isArray(b[k]) && !(b[k] instanceof vde.Vis.Field);
        a[k] = isObj ? {} : self[k];
        if(isObj) aFromB(a[k], b[k], self[k]);
      }
    }

    aFromB(a, b, this);

    return JSON.stringify(a) == JSON.stringify(b);
  };

  prototype.bindProperty = function(prop, opts) {
    var field = opts.field;
    if(!field) return; // Because this makes negatory sense.
    if(!(field instanceof vde.Vis.Field)) field = new vde.Vis.Field(field);

    this[prop] = field;
  };

  prototype.unbindProperty = function(prop) {
    delete this[prop];
  };

  return scale;
})();
