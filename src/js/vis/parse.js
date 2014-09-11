vde.Vis.parse = (function() {

  var vis = vde.Vis,
      dataSources,
      dataToLoad,
      pipelines,
      defaultPipeline,
      warnings,
      SUPPORTED_TRANSFORMS,
      TRANSFORM_PROPERTIES,
      MARK_CONSTRUCTORS,
      MARK_HANDLERS,
      SHARED_MARK_PROPERTIES,
      SCALE_PRESETS,
      unique_id = (function() {
        var i = 0;
        function unique_id() {
          return i++;
        }
        return unique_id;
      })();

  parse.init = function() {
    dataSources = {};
    dataToLoad = [];
    pipelines = {};
    warnings = [];
  };

  function parse(spec) {
    parse.init();

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

    parse.moveObjectsIntoLayers(spec);
    parse.dataSources(spec);
    parse.makePipelines(spec);
    parse.layers(spec);

    return vde.iVis.ngQ()
      .all(dataToLoad)
      .then(vis.render.bind(vis, true))
      .then(function() {
        return warnings;
      });
  }


  parse.moveObjectsIntoLayers = function (spec) {
    var defaultLayer;
    //the only allowed top-level objects are layers.
    ['marks', 'axes', 'scales'].forEach(function(prop) {
      spec[prop] = spec[prop] || [];
      //move all elements into a layer.
      spec[prop].forEach(function(obj, i, arr) {
        if(obj['lyra.groupType'] !== 'layer') {
          //move object into default layer.
          arr[i] = null;
          makeDefaultLayer()[prop].push(obj);
        }
      });
      //filter out removed elements
      spec[prop] = spec[prop].filter(function(a) { return a; });
    });

    function makeDefaultLayer() {
      if(!defaultLayer) {
        defaultLayer = {
          type: 'group',
          from: {},
          name: 'lyra_default_layer_' + unique_id(),
          scales: [],
          axes: [],
          marks: [],
          properties: {
            enter:{
              x:{value: 0},
              y:{value: 0},
              height:{value: vis.properties.height},
              width:{value: vis.properties.width}
            }
          },
          'lyra.displayName': 'Default Layer'
        };
        spec.marks.push(defaultLayer);
      }
      return defaultLayer;
    }
  }

  parse.dataSources = function(spec) {
    //Find inline data sources
    (spec.marks || []).forEach(function hoistInlineDataSource(m) {
      var parent = this,
          markName = m['lyra.displayName'] || m.name || m.type;
      var name;
      if(!m.from || !m.from.data) {
        m.from = m.from || {};
        m.from.data = parent.from.data;
      }
      if(m.from.transform) {
        var id = unique_id();
        name = 'lyra_inline_' + id + '_' + markName + '_' + m.from.data;
        spec.data.push({
          name: name,
          source: m.from.data,
          auto: true,
          transform: m.from.transform,
          'lyra.role' : m.from['lyra.role'],
          'lyra.for': m.from['lyra.for'],
          'lyra.start': true,
          'lyra.displayName': '(Inline ' + id + ': ' + markName + ')' 
        });
        m.from.data = name;
        delete m.from.transform;
      }

      (m.marks || []).forEach(hoistInlineDataSource, m);
    }, {from:{}});

    //index data sources by name.
    spec.data.forEach(function populateName(d) {
      dataSources[d.name] = d;
      d.transform = d.transform || [];
    });

    //join pipeline forks into single data sources
    spec.data = spec.data.filter(function joinForks(d) {
      var source;
      if(d['lyra.role'] === 'fork') {
        source = dataSources[d['lyra.for']];
        dataSources[d.name] = source;
        d.transform.splice(0, d['lyra.start'] ? 0 : source.transform.length);
        source.transform = source.transform.concat(d.transform);
        return false;
      }
      return true;
    });

    //lyra does not support pipelines sourcing from other pipelines
    spec.data.forEach(function untangleSource(d) {
      var source = d.source,
          sourceObj = source && dataSources[source],
          k, transforms;

      if(source && (sourceObj.source || sourceObj.transform && sourceObj.transform.length)) {
        untangleSource(sourceObj);
        transforms = d.transform;
        for(k in sourceObj) {
          if(k !== 'name') d[k] = sourceObj[k];
        }
        d.transform = d.transform.concat(transforms);
      }
    });

    //group injection can cause duplicate transforms in each pipeline
    spec.data.forEach(function removeDuplicateTransforms(d) {
      d.transform = d.transform.filter(function(tr, i, arr) {
        transformLoop: for(var j = 0; j < i; j++) {
          for(var k in tr) {
            if(tr[k] !== arr[j][k]) continue transformLoop;
          }
          return false;
        }
        return true;
      });
    });

    return spec;
  }

  parse.makePipelines = function(spec) {
    //now, we can make the pipelines
    spec.data.forEach(function makePipeline(d) {
      var pipeline;
      if(d.url || d.values) {
        //we need to load some data
        dataToLoad.push(vis.data(d.name, d.url || d.values, d.format || 'json'));
      }
      if(d['lyra.role'] !== 'data_source') {
        pipeline = new vis.Pipeline(null, d.source || d.name);
        pipeline.displayName = d['lyra.displayName'] || d.name;
        pipeline.renamedStatsFields = {};
        pipelines[d.name] = pipeline;
        if(!defaultPipeline) {
          defaultPipeline = pipeline;
        }
        d.transform.forEach(function(tr) {
          pipeline.addTransform(parse.transform(tr, pipeline));
        });
      }
    });
  }


  //Transform properties that require special handling.
  TRANSFORM_PROPERTIES = {
    keys: function(keys, tr, transform) { 
      return keys.map(function(key) {
        return parse.field(key, transform.pipeline());
      });
    },
    test: function(expr, tr, transform) {
      transform.properties.test = expr;
      transform.properties.testHtml = htmlExpr(expr, transform, transform.pipeline());
    },
    expr: function(expr, tr, transform) {
      transform.properties.expr = expr;
      transform.properties.exprHtml = htmlExpr(expr, transform, transform.pipeline());
    },
    layout: function() {
      return vis.transforms.Facet.layout_overlap;
    },
    field: function(field, tr, transform) {
      if(tr.type === 'formula') return field;
      else {
        return parse.field(field, transform.pipeline());
      }
    },
    order: function(_, tr) { return /^\-/.test(tr.by) ? 'Descending' : 'Ascending'; },
    by: function(by, tr, transform) {
      return parse.field(by.replace(/^\-/,''), transform.pipeline());
    },
    output: function(output, tr, transform) {
      for(var k in output) {
        transform.pipeline().renamedStatsFields = pipeline.renamedStatsFields || {};
        transform.pipeline().renamedStatsFields[output[k]] = k;
      }
    },
    size: function(size) { return size || 2; },
    step: function(step) { return step || 1; },
    projection: function(projection, tr, transform) {
      //just a hook to allow us to set geoType for geo and geopath transforms
      transform.geoType = tr.type == 'geo' ? 'Latitude/Longtitude' : 'GeoJSON';
      return projection;
    },
    value: function(field, tr, transform) {
      field = parse.field(field, transform.pipeline());
      if(tr.type === 'stats') {
        transform.properties.field = field;
      } else {
        return field;
      }
    },
    point: function(field, tr, transform) { return parse.field(field, transform.pipeline()); },
    height: function(field, tr, transform) { return parse.field(field, transform.pipeline()); }
  };

  SUPPORTED_TRANSFORMS = {facet:'Facet', filter:'Filter', formula:'Formula', sort:'Sort', stats:'Stats', window:'Window', force:'Force', geo:'Geo', geopath:'Geo', pie:'Pie', stack:'Stack'};
  parse.transform = function(tr, pipeline) {
    var conName = SUPPORTED_TRANSFORMS[tr.type],
        constructor = conName && vis.transforms[conName],
        transform;

    if(!constructor) parse.fail("Unsupported transform: " + tr.type);
    transform = new constructor(pipeline.name);
    //Parse all of the input properties of the transform. 
    transform.input.forEach(function parseProperty(k) {
      var result;
      if(TRANSFORM_PROPERTIES[k]) {
        result = TRANSFORM_PROPERTIES[k](tr[k], tr, transform);
        if(result !== undefined) {
          transform.properties[k] = result;
        }
      } else {
        transform.properties[k] = tr[k];
      }
    });
    return transform;
  }

  parse.field = function(text, pipeline) {
    var tokens = text.split('.'),
        name = tokens.pop(),
        accessor = tokens.length > 0 ? tokens.join('.').replace(/^d\./,'') + '.' : '',
        field, newStatName, statsTransform, k;
    if(accessor === 'stats.' || accessor === '') {
      if(pipeline.transforms.some(function(a){
        return statsTransform = a, a.type === 'stats';
      })) {
        newStatName = pipeline.renamedStatsFields[name];
        if(newStatName)
          field = new vis.Field(statsTransform.properties.field.name, 'stats.', null, pipeline.name, newStatName);
        else
          field = new vis.Field(name, accessor, null, pipeline.name);
      } else {
        field = new vis.Field(name, accessor, null, pipeline.name);
      }
    } else {
      field = new vis.Field(name, accessor, null, pipeline.name);
    }
    return field;
  }

  SHARED_MARK_PROPERTIES = ['x','x2','y','y2','width','height','opacity','fill','fillOpacity','stroke','strokeWidth','strokeOpacity','strokeDash','strokeDashOffset'];
  parse.layers = function(spec) {
    spec.marks.forEach(function(layerSpec) {
      var layerObj = new vis.marks.Group(layerSpec.name);

      layerSpec.properties = layerSpec.properties || {};
      layerSpec.properties.enter = layerSpec.properties.enter || {};
      layerSpec.properties.update = layerSpec.properties.update || {};

      layerObj.displayName = layerSpec['lyra.displayName'] || layerSpec.name;

      SHARED_MARK_PROPERTIES.forEach(function(prop) {
        copyProp(prop, layerSpec, layerObj);
      });

      parse.container(layerSpec, layerObj);
    });
  }

  parse.container = function(spec, layer, group) {
    var info = {
      layer: layer,
      group: group
    };

    (spec.scales || []).forEach(parse.scale, info);
    (spec.marks || []).forEach(parse.mark, info);
    (spec.axes || []).forEach(parse.axis, info);

    if(spec.legends && spec.legends.length) {
      warn("Lyra does not support legends");
    }
  }

  MARK_CONSTRUCTORS = {rect:'Rect', image:'Rect', symbol:'Symbol', arc:'Arc', area:'Area', line:'Line', text:'Text', group: 'Group'};
  MARK_HANDLERS = {
    image: {
      props: ['url', 'baseline', 'align'],
      fn: function(info, mark, markObj) {
        markObj.fillStyle = 'image';
      }
    },
    symbol: {props: ['size', 'shape']},
    arc: {props: ['innerRadius','outerRadius','startAngle','endAngle']},
    area: {props: ['interpolate', 'tension']},
    line: {props: ['interpolate', 'tension']},
    text: {
      props: ['text','align','baseline','dx','dy','radius','theta','angle','font','fontSize','fontWeight','fontStyle'],
      fn: function(info, mark, markObj) {
        markObj.properties.textFormula = 'd.' + markObj.properties.text.field.spec();
        markObj.properties.textFormulaHtml = htmlExpr(markObj.properties.textFormula, markObj, markObj.pipeline());
      }
    },
    group: {
      fn: function(info, mark, markObj) {
        parse.container(mark, info.layer, markObj);
      }
    }
  }
  parse.mark = function(mark) {
    mark.properties = mark.properties || {};
    mark.properties.enter = mark.properties.enter || {};
    mark.properties.update = mark.properties.update || {};
    var info = this,
        conName = MARK_CONSTRUCTORS[mark.type],
        constructor = vis.marks[conName],
        handler = MARK_HANDLERS[mark.type] || {},
        pipeline = pipelines[mark.from.data],
        markObj, facetTransform, props;
    if(!constructor) { parse.fail("Unsupported mark type: " + mark.type); }

    if(mark.type === 'group') {
      if(!pipeline.transforms.some(function(transform) {
        facetTransform = transform;
        return transform.type === 'facet';
      })) {
        parse.fail("Group marks must be layers or derive from facet transforms. Use 'lyra.groupType': 'layer' for layers.")
      }
      markObj = facetTransform.group(info.layer);
      props = mark.properties.enter;
      if(!props.x && !props.x2 || !props.x && !props.width || !props.x2 && !props.width) {
        props.x = {value: 0};
        props.width = info.layer.properties.width || info.layer.properties.x2;
      }
      if(!props.y && !props.y2 || !props.y && !props.height || !props.y2 && !props.height) {
        props.y = {value: 0};
        props.height = info.layer.properties.height || info.layer.properties.y2;
      }
    } else {
      markObj = new constructor(mark.name, info.layer.name, info.group && info.group.name);
    }

    markObj.pipelineName = pipeline.name;
    markObj.displayName = mark['lyra.displayName'] || mark.name || markObj.name;

    SHARED_MARK_PROPERTIES.forEach(function(prop) {
      copyProp(prop, mark, markObj);
    });
    handler.props && handler.props.forEach(function(prop) {
      copyProp(prop, mark, markObj);
    });
    handler.fn && handler.fn(info, mark, markObj);

    if(mark.type !== 'group') markObj.init();

  }

  function copyProp(prop, spec, obj) {
    var any = false;
    if(spec.properties.enter[prop]) {
      any = true;
      obj.properties[prop] = parse.valueRef(spec.properties.enter[prop], obj);
    }
    if(spec.properties.update[prop]) {
      any = true;
      obj.properties[prop] = parse.valueRef(spec.properties.update[prop], obj);
    }
    if(!any) {
      obj.properties[prop] && (obj.properties[prop].disabled = true);
    }
  }

  parse.valueRef = function(ref, mark) {
    ref = vg.duplicate(ref);
    if(ref.group || ref.mult) {
      return parse.fail("Unsupported ValueRef " + JSON.stringify(ref));
    }
    if(!('value' in ref || 'field' in ref)) {
      ref.field = 'data';
    }
    if(ref.field) { ref.field = parse.field(ref.field, mark.pipeline()); }
    if(ref.scale) {
      ref.scale = mark.group().scales[ref.scale] || mark.group().group().scales[ref.scale];
    }
    if(ref.band) { ref.value = 'auto'; }
    return ref;
  }

  function htmlExpr(expr, object, pipeline) {
    return expr.replace(/d\.([\w\.]+)/g, function(match2, match) {
      var bindingScope = vde.iVis.ngScope().$new(),
          binding;
      bindingScope.field = parse.field(match, pipeline);
      object.exprFields.push(bindingScope.field);
      binding = vde.iVis.ngCompile()('<vde-binding style="display: none" field="field"></vde-binding>')(bindingScope);
      bindingScope.$apply();
      return binding.find('.schema').attr('contenteditable', 'false').wrap('<p>').parent().html();
    });
  }

  parse.axis = function(ax) {
    var info = this,
        layer = info.layer,
        groupName = info.group && info.group.name || null;
    var axis = new vis.Axis(ax.name, layer.name, groupName);
    vg.extend(axis.properties, ax);
    axis.properties.scale = layer.scales[axis.properties.scale];
    axis.pipelineName = axis.properties.scale.pipeline().name;
  }

  SCALE_PRESETS = {width:1, height:1, shapes:1, category10:1, category20:1};
  parse.scale = function(scale) {
    var info = this,
        layer = info.layer,
        pipeline = parseDomain(scale.domain) || info.group && info.group.pipeline() || defaultPipeline,
        obj = new vis.Scale(scale.name, pipeline, {}, scale["lyra.displayName"] || scale.name);
    obj.used = true;
    obj.manual = true;
    if(!scale.domain) {
      obj.domainTypes.from = 'field';
    } else if(scale.domain.data) {
      obj.domainTypes.from = 'field';
      obj.domainField = parse.field(scale.domain.field, pipeline);
    } else {
      obj.domainTypes.from = 'values';
      obj.domainValues = scale.domain;
    }

    if(!scale.range) {
      obj.rangeTypes.from = 'field';
    } else if(scale.range.from) {
      obj.rangeTypes.from = 'field';
      obj.rangeField = parse.field(scale.range.field, pipeline);
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

    layer.scales[scale.name] = obj;
    function parseDomain(domain) {
      return (domain && domain.data) ? pipelines[domain.data] : null;
    }
  }

  function warn(msg) {
    warnings.push(msg);
  }

  parse.fail = function(msg) {
    throw new Error("Unable to import Vega spec: " + msg + ". Fix errors and try again.");
  }

  return parse;
})();