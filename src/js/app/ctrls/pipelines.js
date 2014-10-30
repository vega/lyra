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

  // We track the active pipeline's source via pMdl.activePipelineSource to
  // allow showing the new data source popover. Watch the activePipeline.source
  // in case that's set independently.
  $scope.$watch(function() {
    return ($rootScope.activePipeline || {}).source
  }, function() {
    $scope.pMdl.activePipelineSource = ($rootScope.activePipeline || {}).source
  });

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

    var thisTransform = $scope.pMdl.newTransforms[i]
    if(thisTransform.exprFields.length == 0 || thisTransform.properties.field == undefined) {
      alert('Please fill both the fields!!');
      return
    }

    $scope.pMdl.newTransforms[i].pipelineName = $rootScope.activePipeline.name;
    $rootScope.activePipeline.addTransform($scope.pMdl.newTransforms[i]);

    $scope.pMdl.newTransforms.splice(i, 1);
    Vis.render().then(function() { timeline.save(); });
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
      Vis.render().then(function() { timeline.save(); });
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
