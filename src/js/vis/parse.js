/*
  Imports the given Vega spec into Lyra.
  Assumes the Vega spec is valid. However, many valid Vega specs are not
  supported by Lyra. Returns a list of warnings for minor issues. In case
  of major issues, throws an error with a message explaining the unsupported
  feature.
*/
vde.Vis.parseErr = function(spec) {
  try {
    vde.Vis.parse(spec);
  } catch(e) {
    throw new Error(e);
  }
}

vde.Vis.parse = (function() {
  var vis = vde.Vis,
      SUPPORTED_TRANSFORMS = {facet:1, filter:1, formula:1, sort:1, stats:1, window:1, force:1, geo:1, geopath:1, pie:1, stack:1},
      DEFAULT_STAT_NAMES = {count:"count", min:"min", max:"max", sum:"sum", mean:"mean", variance:"variance", stdev:"stdev", median: "median"},
      SHARED_MARK_PROPERTIES = ['x','x2','y','y2','width','height','opacity','fill','fillOpacity','stroke','strokeWidth','strokeOpacity','strokeDash','strokeDashOffset'],
      SCALE_PRESETS = {width:1, height:1, shapes:1, category10:1, category20:1},
      messages, groupUpdates, pipelines, dataSources, sourceNames, scales, layers, renamedStatsFields;

  function parse(spec) {
    messages = [];
    groupUpdates = [];
    dataLoaded = [];
    pipelines = {};
    dataSources = {};
    sourceNames = {};
    scales = {};
    layers = {};
    renamedStatsFields = {};

    spec = vg.duplicate(spec);

    vis.reset();

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

    (spec.data || []).forEach(function(d) {
      dataSources[d.name] = d;
    });
    (spec.data || []).forEach(parseDataSource);

    parseContainer(spec);

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
      dataLoaded.push(vis.data(ds.name, ds.url || ds.values, ds.format || 'json'));
    }
    if(ds["lyra.role"] === 'fork') {
      pipeline = pipelines[sourceNames[ds["lyra.for"]]];
      ds.transform.splice(0, pipeline.transforms.length);
    } else if(ds["lyra.role"] === 'data_source') {
      //Pure data sources don't create pipelines.
      return;
    } else if(!ds["lyra.role"]) {
      pipeline = new vis.Pipeline(null, ds.source || ds.name);
      pipeline.displayName = ds["lyra.displayName"] || ds.name;
      //Lyra renames the pipelines, keep track of the new names.
      pipelines[pipeline.name] = pipeline;
    } else {
      warn("Unrecognized lyra.role " + ds["lyra.role"]);
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

  function parseContainer(spec, layer, group) {
    var info = {
      layer: layer,
      group: group
    };

    (spec.scales || []).forEach(parseScale, info);
    (spec.marks || []).forEach(parseMark, info);
    (spec.axes || []).forEach(parseAxis, info);

    if(spec.legends && spec.legends.length) {
      warn("Lyra does not support legends");
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
        transform.properties.testHtml = htmlExprGenerator(tr.test, transform, pipeline);
        break;
      case "formula":
        transform = new vis.transforms.Formula(pipeline.name);
        transform.properties.expr = tr.expr;
        transform.properties.field = tr.field;
        transform.properties.exprHtml = htmlExprGenerator(tr.expr, transform, pipeline);
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
    var info = this,
        layer = info.layer || defaultLayer(),
        pipeline = parseDomain(scale.domain) || info.group && info.group.pipeline() || defaultPipeline(),
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

    layer.scales[scale.name] = scales[scale.name] = obj;
    function parseDomain(domain) {
      return (domain && domain.data) ? pipelines[sourceNames[domain.data]] : null;
    }
  }

  function parseAxis(ax) {
    var info = this,
        layer = info.layer || defaultLayer(),
        groupName = info.group && info.group.name || null;
    var axis = new vis.Axis(ax.name, layer.name, groupName);
    vg.extend(axis.properties, ax);
    console.log(axis.properties.scale);
    axis.properties.scale = layer.scales[axis.properties.scale];
    axis.pipelineName = axis.properties.scale.pipeline().name;
  }

  function parseMark(mk) {
    function parseDataRef(ref, pipeline) {
      if(!ref) return pipeline || mk["lyra.groupType"] !== 'layer' && defaultPipeline();
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

    var info = this,
        layer = info.layer,
        group = info.group,
        groupName = group && group.name,
        pipeline = parseDataRef(mk.from, group && group.pipeline()) || {},
        mark, facetTransform;

    switch(mk.type) {
    case "rect":
      mark = new vis.marks.Rect(null, (layer || defaultLayer()).name, groupName);
      break;
    case "image":
      mark = new vis.marks.Rect(null, (layer || defaultLayer()).name, groupName);
      mark.fillStyle = 'image';
      ['url','align','baseline'].forEach(copyProp);
      break;
    case "symbol":
      mark = new vis.marks.Symbol(null, (layer || defaultLayer()).name, groupName);
      ['size','shape'].forEach(copyProp);
      break;
    case "path":
      fail("Unsupported mark 'path'");
      break;
    case "arc":
      mark = new vis.marks.Arc(null, (layer || defaultLayer()).name, groupName);
      ['innerRadius','outerRadius','startAngle','endAngle'].forEach(copyProp);
      break;
    case "area":
      mark = new vis.marks.Area(null, (layer || defaultLayer()).name, groupName);
      ['interpolate', 'tension'].forEach(copyProp);
      break;
    case "line":
      mark = new vis.marks.Line(null, (layer || defaultLayer()).name, groupName);
      ['interpolate','tension'].forEach(copyProp);
      break;
    case "text":
      mark = new vis.marks.Text(null, (layer || defaultLayer()).name, groupName);
      ['text','align','baseline','dx','dy','radius','theta','angle','font','fontSize','fontWeight','fontStyle'].forEach(copyProp);
      mark.properties.textFormula = 'd.' + mark.properties.text.field.spec();
      mark.properties.textFormulaHtml = htmlExprGenerator(mark.properties.textFormula, mark, pipeline);
      break;
    case "group":
      if(mk["lyra.groupType"] === 'layer'){
        mark = new vis.marks.Group();
        parseContainer(mk, mark);
      } else if(pipeline.transforms.some(function(tr){
        if(tr.type === 'facet') {
          facetTransform = tr;
          return true;
        }
      })) {
        facetTransform.properties.layout = vis.transforms.Facet.layout_overlap;
        mark = facetTransform.group(layer || defaultLayer());
        mark.layout = vis.transforms.Facet.layout_overlap;
        parseContainer(mk, layer || defaultLayer(), mark);
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
      } else {
        fail("Groups only have limited support. Use 'lyra.groupType': 'layer' for layers.");
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

  function defaultPipeline() {
    //throw "Default Pipeline";
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

  function htmlExprGenerator(expr, object, pipeline) {
    return expr.replace(/d\.([\w\.]+)/g, function(match2, match) {
      var bindingScope = vde.iVis.ngScope().$new(),
          binding;
      bindingScope.field = parseField(pipeline, match);
      object.exprFields.push(bindingScope.field);
      binding = vde.iVis.ngCompile()('<vde-binding style="display: none" field="field"></vde-binding>')(bindingScope);
      bindingScope.$apply();
      return binding.find('.schema').attr('contenteditable', 'false').wrap('<p>').parent().html();
    });
  }

  function warn(msg) {
    messages.push(msg);
  }
  function fail(msg) {
    throw new Error(msg);
  }

  return parse;
})();
