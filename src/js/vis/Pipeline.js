vde.Vis.Pipeline = (function() {
  var pipeline = function(source) {
    this.name = 'vdePipeline_' + (vg.keys(vde.Vis.pipelines).length+1);
    this.displayName = this.name;

    this.source = source;
    this.transforms = [];
    this.forks = [];

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
    this.forks = [];
    this.transforms.forEach(function(t, i) {
      var s = t.spec();
      if(!s) return;

      if(t.forkPipeline) {
        spec++;
        t.forkName || (t.forkName = self.name + '_fork_' + spec);
        specs.push({
          name: t.forkName,
          source: self.source,
          transform: vg.duplicate(specs[spec-1].transform || [])
        });    
        self.forks.push(spec);
      }

      specs[spec].transform.push(s);
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

  return pipeline;
})();