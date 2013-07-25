vde.Vis.Pipeline = (function() {
  var pipeline = function(source) {
    this.name = 'vdePipeline_' + (vg.keys(vde.Vis.pipelines).length+1);
    this.displayName = this.name;

    this.source = source;
    this.transforms = [];

    this.forkName = null;
    this.forkIdx  = null;

    this.scales = {};

    vde.Vis.pipelines[this.name] = this;

    return this;
  };

  var prototype = pipeline.prototype;

  prototype.spec = function() {
    var self = this;
    var specs = [{
      name: this.name,
      source: this.source,
      transform: []
    }];

    vde.Vis.Callback.run('pipeline.pre_spec', this, {spec: specs});

    var spec = 0;
    this.transforms.forEach(function(t, i) {
      if(t.forkPipeline) {
        spec++;
        self.forkName || (self.forkName = self.name + '_' + t.type);
        self.forkIdx = i;

        specs.push({
          name: self.forkName,
          source: self.source,
          transform: vg.duplicate(specs[spec-1].transform || [])
        }); 
      }

      var s = t.spec();
      if(s) specs[spec].transform.push(s);
    });

    vde.Vis.Callback.run('pipeline.post_spec', this, {spec: specs});

    return specs;
  };

  prototype.values = function(sliceBeg, sliceEnd) {
    var values = vg.duplicate(vde.Vis._data[this.source].values).map(vg.data.ingest);
    this.transforms.slice(sliceBeg, sliceEnd).forEach(function(t) {
      if(t.isVisual) return;

      values = t.transform(values);
    });

    return values;
  };

  prototype.schema = function(sliceBeg, sliceEnd) {
    var self = this, 
        fields = [], seenFields = {};
    var values = vg.duplicate(vde.Vis._data[this.source].values).map(vg.data.ingest);

    var buildFields = function(pipeline) {
      [(values[0] || {}).data, values[0], (values.values || [])[0]].forEach(function(v, i) {
        vg.keys(v).forEach(function(k) {
          if(i != 0 && ['data', 'values', 'keys'].indexOf(k) != -1) return;
          if(seenFields[k]) return;

          var field = new vde.Vis.Field(k);
          field.raw = (i == 0);
          field.pipelineName = pipeline;

          fields.push(field);
          seenFields[k] = true;
        });
      });
    };

    // Build fields once before we apply any transforms
    buildFields(this.name);

    var pipelineName = this.name;
    this.transforms.slice(sliceBeg, sliceEnd).forEach(function(t) {
      if(t.forkPipeline) pipelineName = self.forkName;
      if(t.isVisual) return;

      values = t.transform(values);
      buildFields(pipelineName);
    });

    return [fields, values];
  };

  // Given a spec, find a pre-existing scale that matches,
  // or if none do, build a new scale. 
  prototype.scale = function(spec, defaultSpec) {
    for(var scaleName in this.scales) {
      if(this.scales[scaleName].equals(spec))
        return this.scales[scaleName];
    }

    for(var k in defaultSpec)
      spec[k] = defaultSpec[k];

    return new vde.Vis.Scale('', this, spec);
  };

  // Figure out where to add the transform:
  // If the transform requires a fork, add it to the end
  // otherwise, assume look at properties to see where to
  // add it
  prototype.addTransform = function(t) {
    if(t.forkPipeline || t.requiresFork) this.transforms.push(t);
    else {
      var pipelineName = this.name;
      vg.keys(t.properties).some(function(k) {
        if(t.properties[k] instanceof vde.Vis.Field) {
          pipelineName = t.properties[k].pipelineName;
          return true;
        }
      });

      if(pipelineName == this.forkName) this.transforms.push(t);
      else this.transforms.splice(this.forkIdx-1, 0, t);
    }
  };  

  return pipeline;
})();