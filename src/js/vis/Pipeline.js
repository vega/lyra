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

    this.transforms.forEach(function(t, i) {
      if(t.forkPipeline) {
        spec++;
        this.forkName || (this.forkName = self.name + '_' + t.type);
        this.forkIdx = i;

        specs.push({
          name: this.forkName,
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

  prototype.addTransform = function(t) {
    // Figure out where to add the transform:
    // If the transform explicitly requires a fork, always add it
    // to the end of the transform chain. However, if it doesn't
    // look at the fields it uses -- fields from the master, or 
    // from the fork? -- and add it appropriately. 
    if(t.requiresFork) this.transforms.push(t);
    else {
      
    }
  };  

  return pipeline;
})();