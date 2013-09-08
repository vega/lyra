vde.Vis.transforms.Force = (function() {
  var force = function(pipelineName) {
    var self = this;
    vde.Vis.Transform.call(this, pipelineName, 'force');
    this.isVisual = true;

    this.properties = {
      iterations: 500,
      charge: -30,
      linkDistance: 20,
      linkStrength: 1,
      friction: 0.9,
      // theta: 0.8,
      gravity: 0.1
    };

    this.links = {
      data: null,
      source: null,
      target: null,

      shape: 'line',
      tension: 0,

      properties: {
        path: {field: new vde.Vis.Field('path', false)},
        stroke: {value: '#ccc'},
        strokeWidth: {value: 0.5}
      }
    };

    this.input = vg.keys(this.properties);
    this.output = {
      x: new vde.Vis.Field('x', false, 'encoded', pipelineName),
      y: new vde.Vis.Field('y', false, 'encoded', pipelineName),
      weight: new vde.Vis.Field('weight', false, 'linear', pipelineName)
    };

    this.seen = {};

    vde.Vis.callback.register('pipeline.post_spec', this, this.pipelinePostSpec);
    vde.Vis.callback.register('mark.post_spec',  this, this.markPostSpec);
    vde.Vis.callback.register('group.post_spec', this, this.groupPostSpec);
    this.linkFields();

    this.fixedPositions = {};
    vde.Vis.addEventListener('mouseover', this, function(e, i) { return self.onMouseOver(e, i); });
    vde.Vis.addEventListener('mouseout', this,  function(e, i) { return self.onMouseOut(e, i); });
    vde.Vis.addEventListener('dblclick', this,  function(e, i) { return self.onDblClick(e, i); });

    return this;
  }

  force.prototype = new vde.Vis.Transform();
  var prototype = force.prototype;

  prototype.destroy = function() {
    vde.Vis.callback.deregister('pipeline.post_spec', this);
    vde.Vis.callback.deregister('mark.post_spec',  this);
    vde.Vis.callback.deregister('group.post_spec', this);

    vde.Vis.removeEventListener('mouseover', this);
    vde.Vis.removeEventListener('mouseout', this);
    vde.Vis.removeEventListener('dblclick', this);
  };

  prototype.spec = function() {
    if(!this.pipeline() || !this.links.data || !this.links.source || !this.links.target) return;
    var spec = vde.Vis.Transform.prototype.spec.call(this);
    spec.links = this.pipelineName + '_edges';
    this.seen = {};
    return spec;
  };

  prototype.pipelinePostSpec = function(opts) {
    var self = this;
    if(!this.pipeline() || !this.links.data || !this.links.source || !this.links.target) return;
    if(opts.item.name != this.pipelineName) return;

    // Weird Vega Bug
    opts.spec[0].values = vde.Vis._data[opts.spec[0].source].values;
    delete opts.spec[0].source;

    // For fixed nodes, we inject a new data source with the positioning information
    // and then zip/copy them over to our pipeline
    var fixed_nodes = vg.keys(this.fixedPositions).map(function(k) { return self.fixedPositions[k]; });
    if(fixed_nodes.length > 0) {
      opts.spec[0].transform.unshift({
        type: 'copy',
        from: 'fixed_nodes.data',
        fields: ['x', 'y', 'fixed']
      });

      opts.spec[0].transform.unshift({
        type: 'zip',
        key: 'index',
        with: opts.item.name + '_fixed_nodes',
        withKey: 'data.index',
        as: 'fixed_nodes',
        default: {data: {}}
      });

      opts.spec.unshift({
        name: opts.item.name + '_fixed_nodes',
        values: fixed_nodes
      });
    }

    // Inject a separate data source for edges
    opts.spec.unshift({
      name: opts.item.name + '_edges',
      source: this.links.data,
      transform: [{type: 'copy', from: 'data', fields: [this.links.source, this.links.target], as: ['source', 'target']}]
    });


  };

  prototype.markPostSpec = function(opts) {
    if(!this.pipeline() || !this.links.data || !this.links.source || !this.links.target) return;
    if(!opts.item.pipeline() ||
      (opts.item.pipeline() && opts.item.pipeline().name != this.pipeline().name)) return;
    if(this.seen[opts.item.groupName]) return;

    this.seen[opts.item.groupName] = false;
  };

  prototype.groupPostSpec = function(opts) {
    if(!this.pipeline()) return;
    if(this.seen[opts.item.name] != false) return;

    var path = {
      type: 'path',
      from: {
        data: this.pipelineName + '_edges',
        transform: [{type: 'link', shape: this.links.shape, tension: this.links.tension}]
      },
      properties: {enter:{}}
    };

    for(var p in this.links.properties) path.properties.enter[p] = vde.Vis.parseProperty(this.links.properties, p);

    opts.spec.marks.push(path);

    this.seen[opts.item.name] = true;
  };

  // This is gross.
  prototype.linkFields = function() {
    var self = this, scope = vde.iVis.ngScope();
    var fields = function() { return self.links.data ? vg.keys(vde.Vis._data[self.links.data].values[0]) : []; };

    scope.$watch(function($scope) {
      return self.links.data
    }, function() { scope.linkFields = fields(); }, true);

  };

  prototype.onMouseOver = function(e, item) {
    var mark = null;
    if(!(mark = item.mark.def.vdeMdl)) return;
    if(mark.pipelineName != this.pipelineName) return;

    var b = vde.iVis.translatedBounds(item, item.bounds),
        coords = vde.iVis.translatedCoords({ x: b.x1, y: b.y1 - 16 }),
        fixed = this.fixedPositions[item.datum.index];

    $('<div id="transform-force-pin">&nbsp;</div>')
      .addClass(fixed ? 'pinned' : '')
      .css('left', coords.x + 'px')
      .css('top', coords.y + 'px')
      .appendTo('body');
  };

  prototype.onMouseOut = function(e, item) {
    var mark = null;
    if(!(mark = item.mark.def.vdeMdl)) return;
    if(mark.pipelineName != this.pipelineName) return;

    $('#transform-force-pin').remove();
  };

  prototype.onDblClick = function(e, item) {
    var mark = null;
    if(!(mark = item.mark.def.vdeMdl)) return;
    if(mark.pipelineName != this.pipelineName) return;

    var fixed = this.fixedPositions[item.datum.index],
        pin = $('#transform-force-pin');

    if(fixed) delete this.fixedPositions[item.datum.index];
    else
      this.fixedPositions[item.datum.index] = {
        index: item.datum.index,
        x: item.datum.x,
        y: item.datum.y,
        fixed: true
      };

    pin.toggleClass('pinned');
  };

  return force;
})();
