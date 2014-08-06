/*
  Imports the given Vega spec into Lyra.
  Assumes the Vega spec is valid. However, many valid Vega specs are not
  supported by Lyra. Returns a list of warnings for minor issues. In case
  of major issues, throws an error with a message explaining the unsupported
  feature.
*/

vde.Vis.parse = (function() {
  var vis = vde.Vis,
    messages = [],
    pipelines = {},
    dataSources = {},
    sourceNames = {},
    scales = {},
    layers = {},
    groupUpdates = [],
    dataLoaded = [],
    SUPPORTED_TRANSFORMS = {facet:1, filter:1, formula:1, sort:1, stats:1, window:1, force:1, geo:1, geopath:1, pie:1, stack:1},
    DEFAULT_STAT_NAMES = {count:"count", min:"min", max:"max", sum:"sum", mean:"mean", variance:"variance", stdev:"stdev", median: "median"},
    SHARED_MARK_PROPERTIES = ['x','x2','y','y2','width','height','opacity','fill','fillOpacity','stroke','strokeWidth','strokeOpacity','strokeDash','strokeDashOffset'],
    SCALE_PRESETS = {width:1, height:1, shapes:1, category10:1, category20:1},
    renamedStatsFields = {};

  function parse(spec) {
    vis.properties.width = spec.width;
    vis.properties.height = spec.height;
    if(typeof spec.padding === 'number') {
      vis.properties._autopad = false;
      vis.properties.padding = {
        top: spec.padding,
        bottom: spec.padding,
        left: spec.padding,
        right: spec.padding,
      };
    } else if(typeof spec.padding === 'object') {
      vis.properties.padding = spec.padding;
      vis.properties._autopad = false;
    } else if(spec.padding === 'auto'){
      vis.properties.padding = {};
      vis.properties._autopad = true;
    } else {
      vis.properties.padding = {top:30, left:30, right:30, bottom:30};
      vis.properties._autopad = true;
      warn('unknown padding "' + spec.padding + '". Using "auto"');
    }

    vis.reset();

    spec = vg.duplicate(spec);

    (spec.data || []).forEach(function(d) {
      dataSources[d.name] = d;
    });
    (spec.data || []).forEach(parseDataSource);
    (spec.scales || []).forEach(parseScale);
    (spec.marks || []).reverse().forEach(parseMark, {transforms:[]});
    (spec.axes || []).forEach(parseAxis);
    if(spec.legends && spec.legends.length) {
      warn("Lyra does not support legend marks");
    }

    return vde.iVis.ngQ().all(dataLoaded)
      .then(vis.render.bind(vis, true))
      .then(function() { groupUpdates.forEach(function(f){ f(); }); })
      .then(vis.render.bind(vis, true))
      .then(function(){
        return messages;
      });
  }
  
  function parseDataSource(ds) {
    var pipeline, deferred, idx;
    ds.transform = ds.transform || [];
    if(ds.url || ds.values) {
      //This data object defines some data. We need to load it.
      deferred = vde.iVis.ngQ().defer();
      dataLoaded.push(deferred.promise);
      vis.data(ds.name, ds.url || ds.values, ds.format || 'json').then(deferred.resolve.bind(deferred));
    }
    if(ds["lyra.role"] === 'facet' || ds["lyra.role"] === 'stack') {
      pipeline = pipelines[sourceNames[ds["lyra.for"]]];
      ds.transform.splice(0, pipeline.transforms.length);
    } else if(ds["lyra.role"] === 'data_source') {
      return;
    } else if(!ds["lyra.role"]) {
      pipeline = new vis.Pipeline(null, ds.source || ds.name);
      pipeline.displayName = ds["lyra.displayName"] || ds.name;
      //Lyra renames the pipelines, keep track of the new names.
      pipelines[pipeline.name] = pipeline;
    }

    sourceNames[ds.name] = pipeline.name;
    untangleSource(ds);
    ds.transform.forEach(parseTransform, pipeline);

    return pipeline;

    function untangleSource(ds) {
      var source = ds.source,
          sourceObj = source && dataSources[source],
          k, transforms;

      if(source && sourceObj.source) {
        untangleSource(sourceObj);
        transforms = ds.transform || [];
        for(k in sourceObj) {
          if(k !== 'name') ds[k] = sourceObj[k];
        }
        ds.transform = (ds.transform || []).concat(transforms);
      }
    }
  }

  function parseTransform(tr) {
    var pipeline = this,
        transform, k, renamed;
    if(!SUPPORTED_TRANSFORMS[tr.type]) {
      fail("Unsupported transform type '" + tr.type + "'");
    } else {
      switch(tr.type) {
      case "facet":
        transform = new vis.transforms.Facet(pipeline.name);
        transform.properties.keys = tr.keys.map(function(key) {
          return parseField(pipeline, key);
        });
        break;
      case "filter":
        transform = new vis.transforms.Filter(pipeline.name);
        transform.properties.test = tr.test;
        transform.properties.testHtml = tr.test.replace(/d\.[\w\.]+/g, function(match) {
          var bindingScope = vde.iVis.ngScope().$new(),
              binding;
          bindingScope.field = parseField(pipeline, match);
          transform.exprFields.push(bindingScope.field);
          binding = vde.iVis.ngCompile()('<vde-binding style="display: none" field="field"></vde-binding>')(bindingScope);
          bindingScope.$apply();
          return binding.find('.schema').attr('contenteditable', 'false').wrap('<p>').parent().html();
        });
        break;
      case "formula":
        transform = new vis.transforms.Formula(pipeline.name);
        transform.properties.expr = tr.expr;
        transform.properties.field = tr.field;
        transform.properties.exprHtml = tr.expr.replace(/d\.[\w\.]+/g, function(match) {
          var bindingScope = vde.iVis.ngScope().$new(),
              binding;
          bindingScope.field = parseField(pipeline, match);
          transform.exprFields.push(bindingScope.field);
          binding = vde.iVis.ngCompile()('<vde-binding style="display: none" field="field"></vde-binding>')(bindingScope);
          bindingScope.$apply();
          return binding.find('.schema').attr('contenteditable', 'false').wrap('<p>').parent().html();
        });
        break;
      case "sort":
        transform = new vis.transforms.Sort(pipeline.name);
        transform.properties.order = /^\-/.test(tr.by) ? 'Descending' : 'Ascending';
        transform.properties.by = parseField(pipeline, tr.by.replace(/^\-/, ''));
        break;
      case "stats":
        transform = new vis.transforms.Stats(pipeline.name);
        transform.properties.field = parseField(pipeline, tr.value);
        transform.properties.median = tr.median;
        tr.output = tr.output || DEFAULT_STAT_NAMES;
        for(k in tr.output) {
          renamed = renamedStatsFields[pipeline.name] = renamedStatsFields[pipeline.name] || {};
          renamed[tr.output[k]] = k;
        }
        break;
      case "window":
        transform = new vis.transforms.Window(pipeline.name);
        transform.properties.size = tr.size || 2;
        transform.properties.step = tr.step || 1;
        break;
      case "force":
        transform = new vis.transforms.Force(pipeline.name);
        break;
      case "geo": /* falls through */
      case "geopath":
        transform = new vis.transforms.Geo(pipeline.name);
        transform.properties.projection = tr.projection;
        transform.properties.lon = tr.lat;
        transform.properties.lon = tr.lon;
        transform.properties.value = tr.value;
        transform.properties.center = tr.center;
        transform.properties.translate = tr.translate;
        transform.properties.scale = tr.scale;
        transform.properties.rotate = tr.rotate;
        transform.properties.precision = tr.precision;
        transform.properties.clipAngle = tr.clipAngle;
        transform.geoType = tr.type == 'geo' ? 'Latitude/Longtitude' : 'GeoJSON';
        break;
      case "pie":
        transform = new vis.transforms.Pie(pipeline.name);
        transform.properties.sort = tr.sort;
        transform.properties.value = parseField(pipeline, tr.value);
        break;
      case "stack":
        transform = new vis.transforms.Stack(pipeline.name);
        transform.properties.point = parseField(pipeline, tr.point);
        transform.properties.height = parseField(pipeline, tr.height);
        transform.properties.offset = tr.offset;
        transform.properties.order = tr.order;
        break;
      }
    }
    pipeline.addTransform(transform);
  }
  
  function parseScale(scale) {
    var pipeline = parseDomain(scale.domain),
        obj = new vis.Scale(scale.name, pipeline, {}, scale["lyra.displayName"] || scale.name);
    obj.used = true;
    obj.manual = true;
    if(!scale.domain) {
      obj.domainTypes.from = 'field';
    } else if(scale.domain.data) {
      obj.domainTypes.from = 'field';
      obj.domainField = parseField(pipeline, scale.domain.field);
    } else {
      obj.domainTypes.from = 'values';
      obj.domainValues = scale.domain;
    }

    if(!scale.range) {
      obj.rangeTypes.from = 'field';
    } else if(scale.range.from) {
      obj.rangeTypes.from = 'field';
      obj.rangeField = parseField(pipeline, scale.range.field);
    } else if(SCALE_PRESETS[scale.range]){
      obj.rangeTypes.from = 'preset';
      obj.rangeField = new vis.Field(scale.range, '', '', pipeline.name);
    } else {
      obj.rangeTypes.from = 'values';
      obj.rangeValues = scale.range;
    }

    obj.properties.type = scale.type;
    obj.properties.zero = scale.zero;
    obj.properties.nice = scale.nice;
    obj.properties.padding = scale.padding;
    obj.properties.points = scale.points;

    scales[scale.name] = obj;
    function parseDomain(domain) {
      return (domain && domain.data) ? pipelines[sourceNames[domain.data]] : defaultPipeline();
    }
  }

  function parseAxis(ax) {
    var pipeline = this;
    var axis = new vis.Axis(ax.name, layers._default.name);
    axis.pipelineName = pipeline && pipeline.name || defaultPipeline().name;
    vg.extend(axis.properties, ax);
    axis.properties.scale = layers._default.scales[axis.properties.scale];
  }

  function parseMark(mk) {
    var pipeline = parseDataRef(mk.from, this),
        layer = defaultLayer(),
        mark, facetTransform; 

    switch(mk.type) {
    case "rect":
      mark = new vis.marks.Rect(null, layer.name);
      break;
    case "image":
      mark = new vis.marks.Rect(null, layer.name);
      mark.fillStyle = 'image';
      ['url','align','baseline'].forEach(copyProp);
      break;
    case "symbol":
      mark = new vis.marks.Symbol(null, layer.name);
      ['size','shape'].forEach(copyProp);
      break;
    case "path":
      fail("Unsupported mark 'path'");
      break;
    case "arc":
      mark = new vis.marks.Arc(null, layer.name);
      ['innerRadius','outerRadius','startAngle','endAngle'].forEach(copyProp);
      break;
    case "area":
      mark = new vis.marks.Area(null, layer.name);
      ['interpolate', 'tension'].forEach(copyProp);
      break;
    case "line":
      mark = new vis.marks.Line(null, layer.name);
      ['interpolate','tension'].forEach(copyProp);
      break;
    case "text":
      mark = new vis.marks.Text(null, layer.name);
      ['text','align','baseline','dx','dy','radius','theta','angle','font','fontSize','fontWeight','fontStyle'].forEach(copyProp);
      mark.properties.textFormula = 'd.' + mark.properties.text.field.spec();
      mark.properties.textFormulaHtml = mark.properties.textFormula.replace(/d\.[\w\.]+/g, function(match) {
        var bindingScope = vde.iVis.ngScope().$new(),
            binding;
        bindingScope.field = parseField(pipeline, match);
        mark.exprFields.push(bindingScope.field);
        binding = vde.iVis.ngCompile()('<vde-binding style="display: none" field="field"></vde-binding>')(bindingScope);
        bindingScope.$apply();
        return binding.find('.schema').attr('contenteditable', 'false').wrap('<p>').parent().html();
      });
      break;
    case "group":
      if(pipeline.transforms.some(function(tr){
        if(tr.type === 'facet') {
          facetTransform = tr;
          return true;
        }
      })) {
        facetTransform.properties.layout = vis.transforms.Facet.layout_overlap;
        mark = facetTransform.group(layers._default);
        mark.layout = vis.transforms.Facet.layout_overlap;
        (mk.scales||[]).forEach(parseScale, pipeline);
        (mk.marks||[]).reverse().forEach(parseMark, pipeline);
        (mk.axes||[]).forEach(parseAxis, pipeline);
        groupUpdates.push(function() {
          mark.update(['layout']);
          mk.properties = mk.properties || {};
          SHARED_MARK_PROPERTIES.forEach(function(prop){
            mark.properties[prop] = {};
            if(mk.properties.enter && mk.properties.enter[prop]) {
              mark.properties[prop] = parseValueRef(pipeline, mark, mk.properties.enter[prop]);
              mark.properties[prop].disabled = false;
            } else {
              var fromProp = mark.group().properties[prop];
              if(!fromProp) return mark.properties[prop].disabled = true;
              if(fromProp.scale) mark.properties[prop].scale = fromProp.scale;
              if(fromProp.field)
                mark.properties[prop].field = new vde.Vis.Field(fromProp.field.name,
                    fromProp.field.accessor, fromProp.field.type, fromProp.field.pipelineName,
                    fromProp.field.stat);
              if(fromProp.hasOwnProperty('value')) mark.properties[prop].value = fromProp.value;
              if(fromProp.disabled) mark.properties[prop].disabled = fromProp.disabled;
            }
          });
        });
      } else if(mk["lyra.groupType"] === 'layer'){
        fail("Layers are not yet implemented");
      } else {
        fail("Groups only have limited support");
      }
      break;
    }
    SHARED_MARK_PROPERTIES.forEach(copyProp);
    mark.pipelineName = pipeline.name;
    mark.displayName = mk["lyra.displayName"] || mark.displayName;

    if(mark.type !== 'group') {
      mark.init();
    }


    function copyProp(prop) {
      if(!mark) return;
      if(mk.properties && ((mk.properties.enter && mk.properties.enter[prop]) || (mk.properties.update && mk.properties.update[prop]))) {
        if(mk.properties.enter && mk.properties.enter[prop])
          mark.properties[prop] = parseValueRef(pipeline, mark, mk.properties.enter[prop]);
        if(mk.properties.update && mk.properties.update[prop])
          mark.properties[prop] = parseValueRef(pipeline, mark, mk.properties.update[prop]);
      } else {
        mark && mark.properties[prop] && (mark.properties[prop].disabled = true);
      }
    }
  }

  function parseField(pipeline, fieldText) {
    var tokens = fieldText.split('.'),
        name = tokens.pop(),
        accessor = tokens.length > 0 ? tokens.join('.').replace(/^d\./,'') + '.' : '',
        field, newStatName, statsTransform, k;
    if(accessor === 'stats' || accessor === '') {
      if(pipeline.transforms.some(function(a){
        return statsTransform = a, a.type === 'stats';
      })) {
        newStatName = renamedStatsFields[pipeline.name][name];
        field = new vis.Field(statsTransform.properties.field.name, 'stats.', null, pipeline.name, newStatName);
      } else {
        field = new vis.Field(name, accessor, null, pipeline.name);
      }
    } else {
      field = new vis.Field(name, accessor, null, pipeline.name);
    }
    return field;
  }

  function parseValueRef(pipeline, mark, ref) {
    if(!ref) return;
    ref = vg.duplicate(ref);
    if(ref.group || ref.mult) {
      fail("Unsupported ValueRef " + JSON.stringify(ref));
    }
    if(ref.field) {
      ref.field = parseField(pipeline, ref.field);
    }
    if(ref.scale) {
      ref.scale = scales[ref.scale];
      mark.group().scales[ref.scale.name] = ref.scale;
    }
    if(ref.band) {
      ref.value = 'auto';
    }
    return ref;
  }

  function parseDataRef(ref, pipeline) {
    if(!ref) return pipeline || defaultPipeline();
    if(ref.data) {
      pipeline = pipelines[sourceNames[ref.data]];
    }

    if(ref.transform) {
      var spec = pipeline.spec()[0];
      delete spec["lyra.displayName"];
      pipeline = parseDataSource(spec);
      ref.transform.forEach(parseTransform, pipeline);
    }

    return pipeline;
  }

  function defaultPipeline() {
    if(!pipelines._default) {
      pipelines._default = new vis.Pipeline();
      pipelines._default.displayName = "Default Pipeline";
    }
    return pipelines._default;
  }

  function defaultLayer() {
    if(!layers._default) {
      layers._default = new vis.marks.Group();
      layers._default.displayName = "Default Layer";
    }
    return layers._default;
  }

  function warn(msg) {
    messages.push(msg);
  }
  function fail(msg) {
    throw new Error(msg);
  }

  return parse;
})();