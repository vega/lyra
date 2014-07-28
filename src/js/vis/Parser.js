/*
  Imports the given Vega spec into Lyra.
  Assumes the Vega spec is valid. However, many valid Vega specs are not
  supported by Lyra. Returns a list of warnings for minor issues. In case
  of major issues, throws an error with a message explaining the unsupported
  feature.
*/
vde.Vis.importVega = function(spec) {
  var vis = vde.Vis,
      messages = [],
      pipelines = {},
      dataSources = {},
      sourceNames = {},
      SUPPORTED_TRANSFORMS = {facet:1, filter:1, formula:1, sort:1, stats:1, window:1, force:1, geo:1, geopath:1, pie:1, stack:1},
      DEFAULT_STAT_NAMES = {count:"count", min:"min", max:"max", sum:"sum", mean:"mean", variance:"variance", stdev:"stdev", median: "median"},
      renamedStatsFields = {}
  ;
  pipelines._default = new vis.Pipeline();
  pipelines._default.displayName = "Default Pipeline";

  spec = vg.duplicate(spec);

  parseTop(spec);

  return messages;

  function parseTop(topLevel) {
    //Call sub categories before dealing with top-level properties.
    topLevel.data.forEach(function(d) {
      dataSources[d.name] = d;
    });
    topLevel.data.forEach(parseDataSource);
    topLevel.scales.forEach(parseScale);

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
  }
  
  function parseDataSource(ds) {
    var pipeline;
    ds.transform = ds.transform || [];
    if(ds.url || ds.values) {
      //This data object defines some data. We need to load it.
      vis.data(ds.name, ds.url || ds.values, ds.format);
    }
    pipeline = new vis.Pipeline(ds.source || ds.name);
    pipeline.displayName = ds.name;
    //Lyra renames the pipelines, keep track of the new names.
    sourceNames[ds.name] = pipeline.name;
    untangleSource(ds);
    ds.transform.forEach(parseTransform, pipeline);

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
        transform, k, renamed, spec;
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
        console.log(tr.test.replace(/d\.[\w\.]+/g, function(match) {
          var bindingScope = vde.iVis.ngScope().$new();
          console.log("Matched:", match);
          bindingScope.field = parseField(pipeline, match);
          return vde.iVis.ngCompile()('<vde-binding style="display: none" field="field"></vde-binding>')(bindingScope).wrap('<p>').parent().html();
        }));
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
        spec = transform.spec();
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
        obj = new vis.Scale(scale.name, pipeline, scale, scale.name);

    if(!scale.domain) {
      obj.domainTypes.from = 'field';
    } else if(scale.domain.from) {
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
    } else {
      obj.rangeTypes.from = 'values';
      obj.rangeValues = scale.range;
    }

    function parseDomain(domain) {
      return (domain && domain.from) ? pipelines[sourceNames[domain.from]] : pipelines._default;
    }
  }

  function parseAxis(ax) {
    var axis = new vis.Axis(ax.name);

  }

  function parseMark(mark) {

  }

  function parseField(pipeline, fieldText) {
    var tokens = fieldText.split('.'),
        name = tokens.pop(),
        accessor = tokens.join('.').replace(/^d\./,'') + '.',
        field, newStatName;
    if(accessor === 'stats') {
      newStatName = renamedStatsFields[pipeline.name][name[0]];
      field = new vis.Field(name, 'stats.', null, pipeline.name, newStatName.stat);
    } else {
      field = new vis.Field(name, accessor, null, pipeline.name);
    }
    console.log("made field", field);
    return field;
  }

  function warn(msg) {
    messages.push(msg);
  }
  function fail(msg) {
    throw msg;
  }
};