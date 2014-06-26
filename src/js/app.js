vde.App.controller('DataCtrl', function($scope, $rootScope, $http, timeline, Vis, vg, d3) {
  $scope.dMdl = {
    src: {},
    formats: ['json', 'csv', 'tsv'],
    parsings: ['string', 'number', 'boolean', 'date']
  };

  $scope.finishedLoading = function() {
    var src = $scope.dMdl.src;
    src.format.parse = {};

    if(vg.isArray(src.values)) {
      for(var k in src.values[0])
        src.format.parse[k] = vg.isNumber(src.values[0][k]) ? 'number' : 'string';
    }

    $scope.dMdl.isLoading = false;
    $scope.dMdl.hasLoaded = true;
    $scope.dMdl.isObj = !vg.isArray(src.values);
    $scope.dMdl.properties = vg.keys(src.values);
  };

  $scope.loadValues = function() {
    var src = $scope.dMdl.src, req = vg.duplicate(src);
    if($scope.dMdl.from == 'url') {
      req.url = 'proxy.php?url=' + encodeURIComponent(req.url);
      $scope.dMdl.isLoading = true;
      var dataModel = vg.parse.data([req], function() {
        $scope.$apply(function() {
          src.values = dataModel.load[src.name];
          $scope.finishedLoading();
        });
      });
    } else {
      var type = $scope.dMdl.src.format.type;

      if(type == 'json') {
        $scope.dMdl.src.values = JSON.parse($scope.dMdl.values);
        $scope.finishedLoading();
      }
      else {
        $scope.dMdl.src.values = d3[type].parse($scope.dMdl.values);
        $scope.finishedLoading();
      }
    }
  };

  $scope.add = function() {
    var src = $scope.dMdl.src;
    for(var p in src.format.parse) 
      if(src.format.parse[p] == 'string') delete src.format.parse[p];

    Vis._data[src.name] = vg.duplicate(src);
    delete Vis._data[src.name].$$hashKey;  // AngularJS pollution

    $rootScope.activePipeline.source = src.name;
    $scope.dMdl.src = {};
    $rootScope.newData = false;

    timeline.save();
  };

  $scope.cancel = function() {
    $rootScope.newData = false;
    $scope.dMdl.src = {};
    $scope.dMdl.isLoading = false;
    $scope.dMdl.hasLoaded = false;
  };

});
vde.App.controller('EditVisCtrl', function($scope, Vis) {
  $scope.vis = Vis.properties;
});
vde.App.controller('ExportCtrl', ['$scope', '$rootScope', 'timeline', '$window', 'Vis', 'vg', 'PngExporter',
  function($scope, $rootScope, timeline, $window, Vis, vg, PngExporter) {
  $rootScope.export = function() {
    var makeFile = function(data, type) {
      var blob = new Blob([data], {type: type});
      var url = $window.webkitURL || $window.URL;
      return url.createObjectURL(blob);
    };

    $scope.fileName = timeline.fileName || 'lyra';

    // By default, this populates in our HTML 5 canvas element in Lyra.
    // We also want to allow exporting to SVG, so paint that into a dummy SVG.
    return Vis.parse().then(function(spec) {
      vg.headless.render(
          {spec: spec, renderer: "svg", el: "#headless"},
          function(err, data) {
            if (err) throw err;
            $scope.svg = makeFile(data.svg, "image/svg+xml");
          }
      );

      $scope.png = PngExporter.get();

      $scope.inlinedValues = makeFile(JSON.stringify(spec, null, 2), 'text/json');
      Vis.parse(false).then(function(spec) {
        $scope.refData = makeFile(JSON.stringify(spec, null, 2), 'text/json');
      });

      $rootScope.fileOpenPopover = false;
      $rootScope.fileSavePopover = false;
      $rootScope.exportPopover   = !$rootScope.exportPopover;
    });
  };
}]);


vde.App.controller('GroupCtrl', function($scope, $rootScope, Vis) {
  $rootScope.$watch('groupOrder', function() {
    $scope.group = Vis.groups[$scope.layerName];
  });

  $rootScope.$watch(function($scope) {
    return {
      activeVisual: ($scope.activeVisual||{}).name,
      activeGroup: ($scope.activeGroup||{}).name,
      activeLayer: ($scope.activeLayer||{}).name
    };
  }, function() {
    $scope.boundExtents = {};
  }, true);

  $scope.xExtents = [{label: 'Start', property: 'x'},
    {label: 'Width', property: 'width'}, {label: 'End', property: 'x2'}];

  $scope.yExtents = [{label: 'Start', property: 'y'},
    {label: 'Height', property: 'height'}, {label: 'End', property: 'y2'}];
});
vde.App.controller('LayersCtrl', function($scope, $rootScope, $timeout, timeline, Vis, iVis) {
  $scope.gMdl = { // General catch-all model for scoping
    pipelines: Vis.pipelines,
    editVis: false,
    sortableOpts: {
      update: function() {
        $timeout(function() {
          Vis.parse().then(function() { timeline.save(); });
        }, 1);
      },
      axis: 'y'
    },
    fonts: ['Helvetica', 'Verdana', 'Georgia', 'Palatino', 'Garamond', 'Trebuchet MS'],
    interpolation: ['linear', 'step-before', 'step-after', 'basis', 'basis-open', 'cardinal', 'cardinal-open', 'monotone']
  };

  $rootScope.groupOrder = Vis.groupOrder;

  $rootScope.reparse = function() { Vis.parse(); };

  $rootScope.toggleGroup = function(group) {
    if($rootScope.activeVisual &&
        $rootScope.activeVisual.type == 'group' && $rootScope.activeVisual != group)
      $rootScope.activeVisual = null;

    if(group.isLayer()) {
      if($rootScope.activeLayer == group) {
        //We always want an activeLayer...
        //$rootScope.activeLayer = $rootScope.activeGroup = null;
      } else {
        $rootScope.activeGroup = group;
        $rootScope.activeLayer = group;
      }
    } else {
      if($rootScope.activeGroup == group) {
        $rootScope.activeGroup = null;
      } else {
        $rootScope.activeGroup = group;
        $rootScope.activeLayer = group.group();
      }
    }
  };

  $rootScope.toggleVisual = function(v, key, show) {
    if($rootScope.activeVisual == v && !show) {
      $rootScope.activeVisual = null;
      iVis.activeMark = null;
    } else {
      $rootScope.activeVisual = v;

      var group = v.type == 'group' ? v : v.group();
      if(group.isLayer()) {
        $rootScope.activeGroup = group;
        $rootScope.activeLayer = group;
      } else {
        $rootScope.activeGroup = group;
        $rootScope.activeLayer = group.group();
      }

      $rootScope.activePipeline = v.pipelineName ? v.pipeline() : $rootScope.activePipeline;
      $scope.gMdl.activeVisualPipeline = (v.pipeline() || {}).name;

      iVis.activeMark = v;
      iVis.activeItem = key || 0;
    }

    iVis.show('selected');
  };

  $scope.setPipeline = function() {
    var p = $scope.gMdl.activeVisualPipeline;
    if(p === '') $scope.activeVisual.pipelineName = null;
    else if(p == 'vdeNewPipeline') {
      var pipeline = new Vis.Pipeline();
      $scope.activeVisual.pipelineName = pipeline.name;
      $rootScope.activePipeline = pipeline;
      $scope.gMdl.activeVisualPipeline = pipeline.name;
    }
    else {
      $scope.activeVisual.pipelineName = p;
      $rootScope.activePipeline = Vis.pipelines[p];
    }

    return Vis.parse().then(function() { timeline.save(); });
  };

  $scope.addGroup = function() {
    var g = new Vis.marks.Group();
    return Vis.parse().then(function() {
      $rootScope.toggleVisual(g);
      timeline.save();
    });
  };

  $scope.addAxis = function(group) {
    var axis = new Vis.Axis('', group.isLayer() ? group.name : group.group().name,
        !group.isLayer() ? group.name : null);
    $rootScope.activeVisual = axis;

    timeline.save();
  };

  $rootScope.removeVisual = function(type, name, group) {
    var cnf = confirm("Are you sure you wish to delete this visual element?");
    if(!cnf) return;

    if(type == 'group') {
      if(iVis.activeMark == Vis.groups[name]) iVis.activeMark = null;
      Vis.groups[name].destroy();
      delete Vis.groups[name];

      var go = Vis.groupOrder;
      go.splice(go.indexOf(name), 1);
    } else {
      if(iVis.activeMark == group[type][name]) iVis.activeMark = null;
      group[type][name].destroy();
      delete group[type][name];

      if(type == 'marks') {
        var mo = group.markOrder;
        mo.splice(mo.indexOf(name), 1);
      }
    }

    return Vis.parse().then(function() {
      $('.tooltip').remove();
      timeline.save();
    });
  };

  $scope.newTransform = function(type) {
    var t = new Vis.transforms[type]($rootScope.activeVisual.pipelineName);
    $rootScope.activeVisual.pipeline().transforms.push(t);
    $scope.gMdl.showTransforms = false;

    timeline.save();
  };

  $scope.removeTransform = function(i) {
    var cnf = confirm("Are you sure you wish to delete this transformation?");
    if(!cnf) return;

    $rootScope.activeVisual.pipeline().transforms[i].destroy();
    $rootScope.activeVisual.pipeline().transforms.splice(i, 1);
    return Vis.parse().then(function() {
      $('.tooltip').remove();

      timeline.save();
    });
  };

  $scope.toggleProp = function(prop, value) {
    var v = $rootScope.activeVisual;

    var props = prop.split('.'), p = v.properties;
    for(var i = 0; i < props.length; i++)
      p = p[props[i]] || (p[props[i]] = {});

    if(p.value == value) delete p.value;
    else p.value = value;

    if('checkExtents' in v) v.checkExtents(prop);

    if('update' in v) v.update(prop);
    else Vis.parse();
  };
});
vde.App.controller('MarkCtrl', function($scope, $rootScope) {
  $scope.$watch('group.marksOrder', function() {
    $scope.mark = $scope.group.marks[$scope.markName];
    if($scope.mark.type == 'group') $scope.group = $scope.mark;
    else $scope.group = $scope.mark.group();
  });

  $scope.$watch('mark.pipelineName', function() {
    $scope.pipeline = $scope.mark.pipeline();
  });

  $scope.click = function(mark) {
    $rootScope.toggleVisual(mark);
    $scope.gMdl.activeVisualPipeline = $scope.mark.pipelineName || '';
  };
});
vde.App.controller('PipelinesCtrl', function($scope, $rootScope, timeline, vg, Vis) {
  $scope.pMdl = { // General catch-all model for scoping
    pipelines: Vis.pipelines,
    showTransforms: false,
    newTransforms: []
  };

  $scope.$watch(function() {
      return vg.keys(Vis._data);
    }, function() {
    $rootScope.dataSources = vg.keys(Vis._data);
    $rootScope.fromSources = [];
    vg.keys(Vis._data).forEach(function(d) { $scope.fromSources.push({key: d, value: d}); });
    $rootScope.fromSources.push({key: 'New Data Source', value: 'vdeNewData'});
  }, true);

  $rootScope.addPipeline = function() {
    var p = new Vis.Pipeline();
    $rootScope.togglePipeline(p);

    timeline.save();
  };

  $rootScope.togglePipeline = function(p, show) {
    if($rootScope.activePipeline == p && !show) {
      $rootScope.activePipeline = null;
      $scope.pMdl.activePipelineSource = null;
    } else {
      $rootScope.activePipeline = p;
      $scope.pMdl.activePipelineSource = p.source;
    }
  };

  $scope.removePipeline = function(p) {
    delete Vis.pipelines[p];
    $('.tooltip').remove();

    timeline.save();
  };

  $scope.setSource = function() {
    var src = $scope.pMdl.activePipelineSource;
    if(src === '') $rootScope.activePipeline.source = null;
    else if(src == 'vdeNewData') $rootScope.newData = true;
    else $rootScope.activePipeline.source = src;

    timeline.save();
  };

  $scope.newTransform = function(type) {
    $scope.pMdl.newTransforms.push(new Vis.transforms[type]());
    $scope.pMdl.showTransforms = false;
  };

  $scope.addTransform = function(i) {
    $scope.pMdl.newTransforms[i].pipelineName = $rootScope.activePipeline.name;
    $rootScope.activePipeline.addTransform($scope.pMdl.newTransforms[i]);

    $scope.pMdl.newTransforms.splice(i, 1);
    Vis.parse().then(function() { timeline.save(); });
  };

  $scope.removeTransform = function(i, isNewTransform) {
    if(isNewTransform) {
      $scope.pMdl.newTransforms[i].destroy();
      $scope.pMdl.newTransforms.splice(i, 1);
    } else {
      var cnf = confirm("Are you sure you wish to delete this transformation?");
      if(!cnf) return;

      $rootScope.activePipeline.transforms[i].destroy();
      $rootScope.activePipeline.transforms.splice(i, 1);
      Vis.parse().then(function() { timeline.save(); });
    }

    $('.tooltip').remove();
  };

  $scope.addScale = function() {
    var s = new Vis.Scale('', $rootScope.activePipeline, {type: 'ordinal'}, 'new_scale');
    s.manual = true;
    timeline.save();

    return s;
  };
});
vde.App.controller('ScaleCtrl', function($scope, $rootScope, Vis) {
  $scope.types = ['linear', 'ordinal', 'log', 'pow', 'sqrt', 'quantile',
                  'quantize', 'threshold', 'utc', 'time', 'ref'];

  $scope.fromTypes = ['field', 'values'];
  $scope.rangeFromTypes = ['preset', 'values'];
  $scope.rangeTypes = ['spatial', 'colors', 'shapes', 'sizes', 'other'];
  $scope.axisTypes=['x', 'y'];
  $scope.nice = ['', 'second', 'minute', 'hour', 'day', 'week', 'month', 'year'];
  $scope.shapes = ['&#9724;', '&#9650;', '&#9660;', '&#11044;', '&#9830;', '&#43;'];

  $scope.deleteScale = function() {
    var scale = $rootScope.activeScale;
    if(scale.used || !scale.manual) return;

    scale.manual = false;
    Vis.parse().then(function() {
      $rootScope.editBinding({}, 'scale');
    });
  };
});
vde.App.controller('TimelineCtrl', function($scope, $rootScope, $window, timeline, $timeout) {
  var t = function() {
    return {
      length: timeline.timeline.length,
      idx: timeline.currentIdx,
      fileName: timeline.fileName
    };
  };

  $scope.$watch(function() {
    return t();
  }, function() {
    $scope.timeline = t();
  }, true);

  var files = function() {
    $scope.files = [];
    timeline.files().getAll().then(function(files) {
      $scope.files = files.map(function(f) { return f.fileName; });
    });
  };

  files();
  $scope.tMdl = {fileName: null};

  $scope.showOpen = function() {
    $rootScope.fileOpenPopover = !$rootScope.fileOpenPopover;
    $rootScope.fileSavePopover = false;
    $rootScope.exportPopover   = false;
  };

  $scope.open = function(name) {
    timeline.open(name).then(function() {
      $rootScope.fileOpenPopover = false;
    });
  };

  $scope.save = function() {
    if(!$scope.timeline.fileName) {
      $rootScope.fileOpenPopover = false;
      $rootScope.fileSavePopover = !$rootScope.fileSavePopover;
      $rootScope.exportPopover   = false;
    } else {
      timeline.fileName = $scope.timeline.fileName;
      timeline.store().then(function() {
        $rootScope.fileSavePopover = false;
        $timeout(function() { files(); }, 100);
      });
    }
  };

  $rootScope.closeTimelinePopovers = function() {
    $rootScope.fileOpenPopover = false;
    $rootScope.fileSavePopover = false;
    $rootScope.exportPopover   = false;
  };

  $scope.delete = function(name) {
    timeline.delete(name).then(function() {
      $timeout(function() { files(); }, 100);
    });
  };

  $scope.undo = function() { timeline.undo(); };
  $scope.redo = function() { timeline.redo(); };

  $window.addEventListener('keydown', function(keyEvent) {
    var keyCode = keyEvent.keyCode;

    if (keyEvent.metaKey === true || keyEvent.ctrlKey === true) {
      if (keyCode === 89) {
        $scope.$apply(function() { $scope.redo(); });
        keyEvent.preventDefault();
        return false;
      }
      else if (keyCode === 90) {
        //special case (CTRL-SHIFT-Z) does a redo (on a mac for example)
        if (keyEvent.shiftKey === true) {
          $scope.$apply(function() { $scope.redo(); });
        }
        else {
          $scope.$apply(function() { $scope.undo(); });
        }
        keyEvent.preventDefault();
        return false;
      }
    }
  });
});
/* global jQuery */
vde.App.controller('VdeCtrl', function($scope, $rootScope, $window, $timeout,
                                       $location, $http, timeline, Vis, iVis, vg) {
  $scope.load = function() {
    jQuery.migrateMute = true;

    // Load defaults on a timeout to allow everything else to load.
    $timeout(function() {
      if(vg.keys(Vis._rawData).length === 0) {
        Vis.data('medals', 'data/medals.json', 'json');
        Vis.data('olympics', 'data/olympics.json', 'json');
        Vis.data('groups', 'data/groups.json', 'json');
        Vis.data('barley', 'data/barley.json', 'json');
        Vis.data('iris', 'data/iris.json', 'json');
        Vis.data('jobs', 'data/jobs.json', 'json');
        Vis.data('cities', 'data/cities.json', 'json');
        Vis.data('army', 'data/army.json', 'json');
        Vis.data('temps', 'data/temps.json', 'json');
        Vis.data('trailers', 'data/trailers.json', 'json');
        Vis.data('movies', 'data/movies.json', 'json');
        Vis.data('characters', 'data/mis-characters.json', 'json');
        Vis.data('connections', 'data/mis-connections.json', 'json');
        Vis.data('trains', 'data/trains.json', 'json');
        Vis.data('stations', 'data/stations.json', 'json');
        Vis.data('unemployment', 'data/unemployment.json', 'json');
        Vis.data('wheat', 'data/wheat.json', 'json');
        Vis.data('monarchs', 'data/monarchs.json', 'json');
        Vis.data('hotels', 'data/hotels.json', 'json');
        Vis.data('rundown', 'data/rundown.json', 'json');
        Vis.data('deaths', 'data/curves.json', 'json');
        Vis.data('zipcodes', 'data/zipcodes.json', 'json');
        Vis.data('gas', 'data/gas.json', 'json');
      }

      var g = new Vis.marks.Group();
      $rootScope.activeGroup = $rootScope.activeLayer = g;

      var p = new Vis.Pipeline();
      $rootScope.activePipeline = p;

      // To be able to undo all the way back to a default/clean slate.
      Vis.parse().then(function() {
        timeline.save();

        $scope.$watch(function() { return $location.search(); }, function() {
          var ex = $location.search().example;
          if(ex) {
            $http.get('examples/' + ex + '.json').then(function(d) {
              timeline.timeline = d.data;
              timeline.redo();
            });
          }
        }, true);
      });
    }, 500);
  };

  $scope.marks = ['Rect', 'Symbol', 'Arc', 'Area', 'Line', 'Text'];

  // Prevent backspace from navigating back and instead delete
  $window.addEventListener('keydown', function(evt) {
    var m = iVis.activeMark;
    // if(!m || m.type != 'group') return;

    var preventBack = false;
    if (evt.keyCode == 8) {
      var d = evt.srcElement || evt.target;
      if (d.tagName.toUpperCase() === 'INPUT' || d.tagName.toUpperCase() === 'TEXTAREA' ||
          d.contentEditable == "true") {
        preventBack = d.readOnly || d.disabled;
      }
      else preventBack = true;
    }

    if (preventBack) {
      evt.preventDefault();
      if(m && m.type != 'group')
        $rootScope.$apply(function() { $rootScope.removeVisual('marks', m.name, m.group()); });
    }
  });

  // Prompt before unloading
  $window.addEventListener("beforeunload", function(e) {
    var msg = 'You have unsaved changed in Lyra.';
    (e || $window.event).returnValue = msg;     //Gecko + IE
    return msg;                                 //Webkit, Safari, Chrome etc.
  });
});
vde.App.directive('vdeBinding', function($compile, $rootScope, $timeout, timeline, Vis, iVis) {
  return {
    restrict: 'E',
    scope: {
      scale: '=',
      field: '=',
      draggable: '@'
    },
    templateUrl: 'tmpl/inspectors/binding.html',
    controller: function($scope) {
      $rootScope.aggregate = function(stat) {
        var field = $rootScope.activeField;
        field.pipeline().aggregate(field, stat);
        $timeout(function() {
          Vis.parse().then(function() {
            $('#aggregate-popover').hide();
            timeline.save();
          });
        }, 1);
      };

      $scope.editBinding = $rootScope.editBinding = function(evt, part) {
        var inspector = null;
        var winHeight = $(window).height(), winWidth = $(window).width(),
            pageX = evt.pageX, pageY = evt.pageY;

        if(part == 'scale') {
          inspector = $('#scale-popover');
          $rootScope.activeScale = inspector.is(':visible') ? null : $scope.scale;
          iVis.parse($rootScope.activeScale); // Visualize scale
        } else {
          inspector = $('#aggregate-popover');
          $rootScope.activeField = inspector.is(':visible') ? null : $scope.field;
        }

        $timeout(function() {
          inspector.css('left', (pageX-15) + 'px');
          inspector.removeClass('top bottom left right top-left top-right bottom-left bottom-right');
          var className = '';

          if(pageX > winWidth/2) {
            inspector.css('left', (pageX - inspector.width() - 20) + 'px');
            className += 'left left-';
          } else {
            inspector.css('left', (pageX + 20) + 'px');
            className += 'right right-';
          }

          if(pageY > winHeight / 2) {
            inspector.css('top', (pageY - inspector.height() + 15) + 'px');
            className += 'top';
          } else {
            inspector.css('top', pageY - 20 + 'px');
            className += 'bottom';
          }

          inspector.addClass(className);
          inspector.toggle();
        }, 100);
      };
    }
  };
});
vde.App.directive('vdeCanDropField', function() {
  return {
    restrict: 'E',
    templateUrl: 'tmpl/inspectors/can-drop-field.html',
    link: function(scope, element, attrs) {
      scope.style = attrs.style;
      scope.canUnbind = function() {
        if(scope.$parent.getScale() || scope.$parent.getField()) {
          scope.$parent.unbind();
          $('.tooltip').remove();
          return true;
        }

        return false;
      };
    }
  };
});
vde.App.directive('vdeDataGrid', function ($rootScope, draggable, vg, $timeout) {
  return {
    restrict: 'A',
    scope: {
      pipeline: '=',
      sliceBeg: '&',
      sliceEnd: '&'
    },
    templateUrl: 'tmpl/inspectors/datasheet.html',
    controller: function($scope, $element) {
      var columns = [], fullData = [];

      function getSchema() { 
        var schema = $scope.pipeline.schema($scope.sliceBeg(), $scope.sliceEnd());
        columns  = schema[0];
        fullData = schema[1];

        // Hierarchical data (which is always nested under fullData.values)
        if(vg.isObject(fullData) && !vg.isArray(fullData)) {
          $scope.facets = fullData.values.map(function(v) { return v.key });
          $scope.facet = $scope.facets[0];
          $scope.fullSize = fullData.values.reduce(function(acc, v) { 
            return acc+v.values.length }, 0);
        } else {
          $scope.facets = [];
          $scope.facet = null;
          $scope.fullSize = fullData.length;
        }

        $scope.limit = 20;
        $scope.page  = 0;
      };

      function transposeData() {
        var data = fullData, transpose = [];
        if($scope.facet) {
          for(var i = 0; i < fullData.values.length; i++) {
            if(fullData.values[i].key == $scope.facet) {
              data = fullData.values[i].values;
              break;
            }
          }
        }

        $scope.size = data.length;
        data = data.slice($scope.page*$scope.limit, $scope.page*$scope.limit + $scope.limit);

        for(var i = 0; i < columns.length; i++) {
          var row = [columns[i]];

          for(var j = 0; j < data.length; j++)
            row.push(columns[i].spec() == "key" ? $scope.facet : 
              eval("data[j]." + columns[i].spec()))

          transpose.push(row);
        }

        $scope.transposedData = transpose;
      };

      $scope.prevPage = function()  { --$scope.page; }
      $scope.nextPage = function()  { ++$scope.page; }
      $scope.setFacet = function(f) { $scope.facet = f; } 

      $scope.$watch(function($scope) {
        return {
          name: $scope.pipeline.name,
          source: $scope.pipeline.source,
          transforms: $scope.pipeline.transforms.map(function(t) { return t.properties; })
        };
      }, function() { getSchema(); transposeData(); }, true);

      $scope.$watch(function($scope) {
        return {page: $scope.page, facet: $scope.facet}
      }, transposeData, true);

      var carouselInterval;
      $scope.carousel = function(evt) {
        var target = $(evt.currentTarget);

        window.clearInterval(carouselInterval);
        carouselInterval = window.setInterval(function() {
          var threshold = target.width()/ 5, leftOffset = target.offset().left,
              left = leftOffset + threshold,
              right = leftOffset + target.width() - threshold,
              scroll = evt.pageX < left ? -1 : evt.pageX > right ? 1 : 0;

          target.scrollLeft(target.scrollLeft() + scroll);
        }, 5);
      };

      $scope.clearCarousel = function() {
        window.clearInterval(carouselInterval);
      };
    }
  };
});
vde.App.directive('vdeDraggable', function($rootScope, draggable) {
  return function(scope, element) {
    element
      .drag('start', function(e, dd) {
        var proxy = $(this).clone(true, true)
            .addClass('proxy')
            .css('opacity', 0.75)
            .css('position', 'absolute')
            .css('z-index', 100)
            .appendTo(document.body);

        return draggable.dragstart(e, dd, proxy);
      })
      .drag(draggable.drag)
      .drag('end', draggable.dragend);
  };
});
vde.App.directive('vdeEditName', function() {
  return {
    restrict: 'A', // only activate on element attribute
    require: '?ngModel', // get a hold of NgModelController
    link: function(scope, element, attrs, ngModel) {
      if(!ngModel) return; // do nothing if no ng-model

      // Specify how UI should be updated
      ngModel.$render = function() {
        element.text(ngModel.$viewValue || '');
      };

      // Listen for change events to enable binding
      element.on('blur keyup change', function() {
        scope.$apply(read);
      });

      //Editing

      //For heading, user need to click the edit icon (in the template html file), which will call edit() on click.
      scope.edit = function() {
        element.attr('contentEditable', true);
        element.focus();
      };

      // If it's a property value (e.g. color or slider val), click on the property span
      if(element.parent().prop('tagName') != 'H3'){
        element.on('click',scope.edit);
      }





      element.on('blur keydown', function(evt) {
        if(!evt.keyCode || (evt.keyCode && evt.keyCode == 13))
          element.attr('contentEditable', false);
      });

      // Write data to the model
      function read() {
        var html = element.text();
        // When we clear the content editable the browser leaves a <br> behind
        if(html == '<br>' ) html = '';
        ngModel.$setViewValue(html);
      }
    }
  };
});
vde.App.directive('vdeExpr', function($rootScope, $compile, $timeout, timeline, Vis, iVis) {
  return {
    restrict: 'A',
    scope: {
      item: '=',
      property: '=',
      ngModel: '=',
      vdeExpr: '@'
    },
    template: '<vde-can-drop-field style="right"></vde-can-drop-field><div class="expr" contenteditable="true"></div>',
    link: function(scope, element, attrs) {
      var parse = function() {
        var elem = $(element).find('.expr');
        var html  = elem.html().replace('<br>','');
        var value = $('<div>' + html + '</div>');
        var strConcat = (attrs.vdeExpr == 'str');
        var digesting = (scope.$$phase || scope.$root.$$phase);

        // When we add a transform containing an expr to the pipeline, the references
        // change and this function is called before .expr.html() is rendered correctly.
        if(digesting && html === "") return;

        value.find('.schema').each(function(i, e) {
          if(strConcat) $(e).text('" + d.' + $(e).attr('field-spec') + ' + "');
          else          $(e).text('d.' + $(e).attr('field-spec'));
        });

        var applyProperties = function() {
          scope.item.properties[scope.property] = strConcat ? '"' + value.text() + '"' : value.text();
          scope.item.properties[scope.property + 'Html'] = html;

          Vis.parse();
        };

        // Safe apply in case parse is called from within a watch.
        if(digesting) applyProperties();
        else          scope.$apply(applyProperties);
      };

      $(element).find('.expr')
        // .html(scope.$parent.ngModel)
        .drop(function(e, dd) {
          var field = $(iVis.dragging).data('field') || $(iVis.dragging).find('.schema').data('field');
          if(!field) return;

          if(scope.item instanceof Vis.Transform &&
            !scope.item.requiresFork && field instanceof Vis.Field)
              scope.item.requiresFork = ($rootScope.activePipeline.name != field.pipelineName);

          var bindingScope = $rootScope.$new();
          bindingScope.field = new Vis.Field(field);
          scope.item.exprFields.push(bindingScope.field);
          var binding = $compile('<vde-binding style="display: none" field="field"></vde-binding>')(bindingScope);
          scope.$apply();

          if(scope.item.properties.textFormulaHtml == "Text"){
            //If the text is currently just the default value, clear text
            $(this).text("");
          }

          $(this).append(binding.find('.schema').attr('contenteditable', 'false'));

          if(dd) dd.proxy = null;
          $('.proxy').remove();
//          parse();
          $(this).focus();
        }).drop('dropstart', function() {
          $(this).parent().css('borderColor', '#333');
        }).drop('dropend', function() {
          $(this).parent().css('borderColor', '#aaa');
        })
        .bind('keyup', function() { parse(); })
        .bind('click', function() { $(this).focus(); });

      $(element).bind('click', function() { $(this).find('.expr').focus(); });

      // This captures any aggregation changes made to the fields used. We need to set it on
      // a timeout because parse requires the html of element to have been completely rendered.
      scope.$watch('item.exprFields', function() { $timeout(function() { parse(); }, 100); }, true);

      // NgModel is registered on the top-level directive. We need this to move the value of
      // the model into our editable div.
      scope.$watch(function($scope) { return $scope.ngModel; },
        function() {
          var expr = $(element).find('.expr'), html = scope.ngModel;
          if(expr.html() != html) expr.html(html);
        }, true);
    }
  };
});
vde.App.directive('vdeField', function(Vis) {
  return {
    scope: { vdeField: '=' },
    link: function(scope, element, attrs) {
      scope.$watch('vdeField', function() {
        if(scope.vdeField instanceof Vis.Field) 
          element.data('field', scope.vdeField)
            .attr('field-spec', scope.vdeField.spec());
      });
    }
  }
});
vde.App.directive('vdeInferredPopover', function($timeout) {
  return {
    restrict: 'A',
    link: function(scope, element) {
      var canDropField = element.parent().find('.canDropField');
      var dropOffset = canDropField.offset();
      var threshold = $('#groups-list').offset().left + $('#groups-list').width()/2 - 10;

      // Position the popover above the nearest .canDropField
      element.removeClass('bottom-left bottom-right')
          .addClass(dropOffset.left > threshold ? 'bottom-right' : 'bottom-left')
          .css({ top: (dropOffset.top - 60), left: 10 });

      // Fade out the popover after a few seconds, but if the user mouses
      // in/out, restart the fading timer. If we fade out, then that implies
      // the user is ok with the inference, so clear out the inference flag.
      var fadeOut = function() {
        return $timeout(function() {
          element.fadeOut();
          delete scope.item.properties[scope.property].inferred;
        }, 3000);
      };

      var f = fadeOut();
      element.on('click mouseover', function() { $timeout.cancel(f); })
        .on('mouseleave', function() { f = fadeOut(); });
    }
  };
});
vde.App.directive('vdePosNewData', function () {
  return function(scope, element) {
    element.on('change', function(evt) {
      var offset = $(evt.target).offset();
      $('#data-popover').css('top', (offset.top+25) + 'px');
    });
  };
});
vde.App.directive('vdeProperty', function($rootScope, timeline, Vis, iVis, vg) {
  return {
    restrict: 'E',
    scope: {
      label: '@',
      type: '@',
      max: '@',
      min: '@',
      step: '@',
      item: '=',
      property: '@',
      ngModel: '=?',
      scale: '=?',
      field: '=?',
      options: '=?',
      nodrop: '@',
      canDropStyle: '@',
      nochange: '@',
      hint: '@',
      hintUrl: '@',
      style: '@',
      extentsProps: '=?',
      extentsBound: '=?',
      imgFill: '@'
    },
    transclude: true,
    templateUrl: function(tElement, tAttrs) {
      var tmpl = 'tmpl/inspectors/property';
      if(tAttrs.imgFill) return tmpl + '-imgfill.html';
      if(tAttrs.extentsProps) return tmpl + '-extents.html';

      return tmpl + '.html';
    },
    controller: function($scope, $element, $attrs, $timeout) {
      $scope.fillTypes = [{label: 'Color', property: 'color'},
        {label: 'Image', property: 'image'}];

      // We can't simply check for $scope.scale or $scope.field because of
      // the extents properties. So use this instead.
      $scope.getScale = function() {
        var prop = (($scope.item||{}).properties||{})[$scope.property];
        return $scope.scale || (prop ? prop.scale : false);
      };

      $scope.getField = function() {
        var prop = (($scope.item||{}).properties||{})[$scope.property];
        return $scope.field || (prop ? prop.field : false);
      };

      $scope.$watch(function($scope) {
        return {
          property: $scope.property,
          scale: $scope.getScale(),
          field: $scope.getField()
        };
      }, function() {
        var scale = $scope.getScale();
        if(scale && scale.properties.type == 'ordinal') {
          var domain = scale.field(), field = $scope.getField();

          if(field) {
            $scope.fieldMatchesDomain = (domain instanceof Vis.Field) ?
                field.spec() == domain.spec() : false;
          } else if(!scale.pipeline().forkName) {
            $scope.values = (domain instanceof Vis.Field) ?
                scale.pipeline().values().map(vg.accessor(domain.spec())).concat(['auto']) :
                domain;
          }
        }
      }, true);

      $scope.onchange = function(prop) {
        if(!prop) prop = $scope.property;
        if($attrs.nochange) return;
        if('checkExtents' in $scope.item)
          $scope.item.checkExtents(prop);

        // X/Y-Axis might be added by default if fields dropped over dropzones.
        // If the user toggles to them, assume they're going to edit, and delete
        // default flag to prevent the axis from being overridden by future drops.
        if($scope.item instanceof Vis.Axis) delete $scope.item.default;

        // For non-layer groups, if any of the spatial properties are changed
        // then switch the layout to overlapping.
        if(['x', 'x2', 'width', 'y', 'y2', 'height'].indexOf(prop) != -1 &&
            $scope.item.type == 'group' && !$scope.item.isLayer())
          $scope.item.layout = Vis.transforms.Facet.layout_overlap;

        $timeout(function() {
          if($scope.item.update) {
            $scope.item.update(prop);
            iVis.show('selected');
            timeline.save();
          } else {
            Vis.parse().then(function() {
              iVis.show('selected');
              timeline.save();
            });
          }
        }, 1);
      };

      $scope.unbind = function(property) {
        if(!property) property = $scope.property;
        $scope.item.unbindProperty(property);
        Vis.parse().then(function() { timeline.save(); });
      };

      $scope.unInferProperty = function(property, field) {
        $scope.item.bindProperty(property, {
          field: field,
          pipelineName: field.pipelineName
        });
      };

      $scope.showHelper = function(target, e, helperClass) {
        if($scope.item instanceof Vis.Mark) $scope.item.helper($scope.property);

        target.addClass(helperClass);
      };

      $scope.hideHelper = function(target, e, helperClass) {
        target.removeClass(helperClass);
        if(target.hasClass('helper') || target.hasClass('drophover')) return;

        if(!iVis.dragging) iVis.show('selected');
        else if($rootScope.activeVisual instanceof Vis.Mark)
          $rootScope.activeVisual.propertyTargets();
      };

      // This block of code ensures that the extent selects stay in sync.
      if($scope.extentsProps) {
        $scope.$watch(function($scope) {
          return {p: $scope.property, b: $scope.extentsBound,
            v: $scope.extentsProps.map(function(p) { return $scope.item.properties[p.property]; })};
        }, function(newVal, oldVal) {
          $scope.properties = [];

          if(newVal.p != oldVal.p) {
            if(newVal.p) {
              delete $scope.item.properties[newVal.p].disabled;
              $scope.extentsBound[newVal.p] = 1;
            }

            if(oldVal.p) {
              $scope.item.properties[oldVal.p].disabled = true;
              delete $scope.extentsBound[oldVal.p];
            }
          }

          // This happens if a production rule disables the current property.
          if(newVal.p && $scope.item.properties[newVal.p].disabled) {
            newVal.p = null;
            $scope.property = null;
          }

          $scope.extentsProps.forEach(function(prop) {
            var p = prop.property, bind = false;
            if($scope.item.properties[p].disabled) bind = true;
            else if(newVal.p == p) bind = true;
            else {
              if(!newVal.p && !$scope.property && !(p in $scope.extentsBound)) {
                $scope.property = p;
                $scope.extentsBound[p] = 1;
                bind = true;
              }
              if(!(p in $scope.extentsBound)) bind = true;
            }

            if(bind) $scope.properties.push(prop);
          });
        }, true);
      }
    },
    link: function(scope, element, attrs) {
      if(attrs.nodrop) return;

      $(element).find('.property, .canDropField').on('mousemove', function(e) {
        scope.showHelper($(this), e, 'helper');
      }).on('mouseleave', function(e) {
        scope.hideHelper($(this), e, 'helper');
      }) // Clear helpers
      .drop(function(e, dd) {
        if(element.find('.expr').length > 0) return element.find('.expr').drop(e, dd);
        if($rootScope.activeScale && $rootScope.activeScale != scope.item) return;

        iVis.bindProperty(scope.item, scope.property);
        dd.proxy = null;
      }).drop('dropstart', function(e) {
        if($rootScope.activeScale && $rootScope.activeScale != scope.item) return;
        scope.showHelper($(this), e, 'drophover');
      }).drop('dropend', function(e) {
        if($rootScope.activeScale && $rootScope.activeScale != scope.item) return;
        scope.hideHelper($(this), e, 'drophover');
      });
    }
  };
});
vde.App.directive('vdeScaleValues', function(Vis, vg) {
  return {
    restrict: 'E',
    scope: {
      type: '@',
      scale: '=',
      property: '@',
      options: '=',
      ngModel: '='
    },
    templateUrl: 'tmpl/inspectors/scale-values.html',
    controller: function($scope) {
      $scope.values = (($scope.scale || {})[$scope.property] || []).map(function(v) { return {value: v}; });

      $scope.update = function() {
        $scope.scale[$scope.property] = vg.keys($scope.values).map(function(k) { return $scope.values[k].value; });
        Vis.parse();
      };

      $scope.add = function(evt, button) {
        if((evt && evt.keyCode != 13) && !button) return;
        $scope.values.push({ value: $scope.newValue });
        $scope.update();
        $scope.newValue = '';
      };

      $scope.deleteIfEmpty = function($index) {
        if($scope.values[$index].value === '') $scope.values.splice($index, 1);
        $scope.update();
      };

      $scope.delete = function($index){
        $scope.values.splice($index, 1);
        $scope.update();
      };
    }
  };
});
vde.App.directive('vdeTooltip', function() {
  return function(scope, element, attrs) {
    element.tooltip({
      title: attrs.vdeTooltip,
      placement: attrs.position ? attrs.position : 'bottom',
      // delay: { show: 300, hide: 150 },
      container: 'body'
    });
  };
});
vde.App.factory('draggable', function($rootScope, Vis, iVis) {
  return {
    dragstart: function(e, dd, proxy) {
      var isMark = proxy.hasClass('mark'),
          v = iVis.activeMark;

      if(isMark) {
        var markType = proxy.attr('id');
        iVis.newMark = new Vis.marks[markType]();
      } else {
//        $(dd.available).each(function(i, a) {
//          // Only light up properties without nodrop
//          if(!$(a).hasClass('property')) return;
//          if($(a).parent().attr('nodrop')) return;
//
//          $(a).addClass('available');
//        });
        $('.canDropField').addClass('dragging');
      }

      if(v instanceof Vis.Mark) {
        if(isMark && iVis.newMark.canConnect) v.connectionTargets();
        else if(!isMark)  {
          // Definitely show any property targets for the active visual
          v.propertyTargets(null, !$rootScope.activePipeline.forkName);
        }
      } else if(!isMark && !v) {
        // If the pipeline doesn't already have a facet applied to it
        // show dropzones for grouping
        if(!$rootScope.activePipeline.forkName) {
          var targets = $rootScope.activeLayer.propertyTargets();
          iVis.interactor('span', targets.spans)
            .interactor('dropzone', targets.dropzones)
            .show(['span', 'dropzone']);
        }
      }

      return proxy;
    },

    drag: function(e, dd) {
      iVis.dragging = dd.proxy;
      $(dd.proxy).css({
        top: e.pageY + 5,
        left: e.pageX - $(dd.proxy).width()
      });
    },

    dragend: function(e, dd) {
      iVis.dragging = null;
      iVis.newMark  = null;
      iVis.show('selected');
//      $(dd.available).removeClass('available');
      $(dd.proxy).unbind().empty().remove();
      dd.proxy = null;
      $('.canDropField').removeClass('dragging');
      $('.tooltip').remove();
    }
  };
});

/* global vg, d3, vde*/

//These services exist so that Angular code does not need to access
//globals. Now, they ask for these to be injected. That way, these 
//can be replaced with mocks if necessary.

vde.App.factory('Vis', function() {
	return vde.Vis;
});

vde.App.factory('vg', function() {
	return vg;
});

vde.App.factory('iVis', function() {
	return vde.iVis;
});

vde.App.factory('d3', function() {
	return d3;
});
vde.App.factory('PngExporter', function() {
  return {
    get: function() {
      return $('#vis canvas')[0].toDataURL("image/png");
    }
  };
});
vde.App.factory('timeline', ["$rootScope", "$timeout", "$indexedDB", "$q", "Vis", "iVis",
  function($rootScope, $timeout, $indexedDB, $q, Vis, iVis) {
    // We can't let the timeline grow too large because it'll all our RAM.
    var timelineLimit = 25;

    return {
      timeline: [],
      currentIdx: -1,
      fileName: null,
      tutorial: false,  // If in tutorial mode, don't truncate to timelineLimit

      files: function() {
        return $indexedDB.objectStore('files');
      },

      open: function(fileName) {
        var deferred = $q.defer(), timeline = this;

        this.files().find(fileName).then(function(file) {
          timeline.fileName   = file.fileName;
          timeline.timeline   = file.timeline;
          timeline.currentIdx = file.timeline.length - 1;

          timeline.redo();
          deferred.resolve(file);
        });

        return deferred.promise;
      },

      store: function() {
        var deferred = $q.defer();
        var vis = Vis.export(true);
        var app = this.timeline[this.timeline.length - 1].app;

        this.files().upsert({
          fileName: this.fileName,
          timeline: [{ vis: vis, app: app }],
          currentIdx: this.currentIdx
        }).then(function(e) { deferred.resolve(e); });

        return deferred.promise;
      },

      delete: function(name) {
        var deferred = $q.defer();

        this.files().delete(name)
            .then(function(e) { deferred.resolve(e); });

        return deferred.promise;
      },

      save: function() {
        var vis = Vis.export(false);
        delete vis._data;

        this.timeline.length = ++this.currentIdx;
        this.timeline.push({
          vis: vis,
          app: {
            activeVisual: ($rootScope.activeVisual || {}).name,
            isMark: $rootScope.activeVisual instanceof Vis.Mark,
            isGroup: $rootScope.activeVisual instanceof Vis.marks.Group,
            activeLayer: ($rootScope.activeLayer||{}).name,
            activeGroup: ($rootScope.activeGroup||{}).name,
            activePipeline: ($rootScope.activePipeline||{}).name
          }
        });

        if(this.timeline.length > timelineLimit && !this.timeline.tutorial) {
          this.timeline.splice(0, this.timeline.length - timelineLimit);
          this.currentIdx = this.timeline.length - 1;
        }
      },

      load: function(idx) {
        var t = this.timeline[idx], vis = t.vis, app = t.app;
        var digesting = ($rootScope.$$phase || $rootScope.$root.$$phase);

        var f = function() {
          $rootScope.groupOrder = Vis.groupOrder = [];
          Vis.import(vis).then(function() {
            if(app.activeLayer) {
              var g = Vis.groups[app.activeLayer];
              if(app.activeGroup && app.activeLayer != app.activeGroup)
                g = g.marks[app.activeGroup];

              if(app.activeVisual) {
                $rootScope.toggleVisual(app.isMark ? app.isGroup ? g :
                    g.marks[app.activeVisual] : g.axes[app.activeVisual], 0, true);
              } else {
                // If we don't have an activeVisual, clear out any interactors
                iVis.activeMark = null;
                iVis.show('selected');
              }
            }

            if(app.activePipeline)
              $rootScope.togglePipeline(Vis.pipelines[app.activePipeline], true);
          });
        };

        if(digesting) {
          f();
        } else {
          $rootScope.$apply(f);
        }
      },

      undo: function() {
        this.currentIdx = (--this.currentIdx < 0) ? 0 : this.currentIdx;
        this.load(this.currentIdx);
      },

      redo: function() {
        this.currentIdx = (++this.currentIdx >= this.timeline.length) ?
            this.timeline.length - 1 : this.currentIdx;
        this.load(this.currentIdx);
      }

    };
}]);