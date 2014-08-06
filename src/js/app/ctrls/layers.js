vde.App.controller('LayersCtrl', function($scope, $rootScope, $timeout, timeline, Vis, iVis) {
  $scope.gMdl = { // General catch-all model for scoping
    pipelines: Vis.pipelines,
    editVis: false,
    sortableOpts: {
      update: function() {
        $timeout(function() {
          Vis.render().then(function() { timeline.save(); });
        }, 1);
      },
      axis: 'y'
    },
    fonts: ['Helvetica', 'Verdana', 'Georgia', 'Palatino', 'Garamond', 'Trebuchet MS'],
    interpolation: ['linear', 'step-before', 'step-after', 'basis', 'basis-open', 'cardinal', 'cardinal-open', 'monotone']
  };

  $rootScope.groupOrder = Vis.groupOrder;

  $rootScope.reparse = function() { Vis.render(); };

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

    return Vis.render().then(function() { timeline.save(); });
  };

  $scope.addGroup = function() {
    var g = new Vis.marks.Group();
    return Vis.render().then(function() {
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

    return Vis.render().then(function() {
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
    return Vis.render().then(function() {
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
    else Vis.render();
  };
});