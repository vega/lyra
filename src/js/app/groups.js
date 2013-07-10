vde.App.controller('GroupsCtrl', function($scope, $rootScope, $location) {
  $scope.gMdl = { // General catch-all model for scoping
    groups: vde.Vis.groups,
    pipelines: vde.Vis.pipelines
  }; 

  $scope.toggleVisual = function(v) {
    $rootScope.activeVisual = v;
    $rootScope.activeGroup  = v.group || v;

    if(v.pipeline) {
      $rootScope.activePipeline = v.pipeline;
      $scope.gMdl.activeVisualPipeline = v.pipeline.name;
    }
  };  

  $scope.setPipeline = function() {
    var p = $scope.gMdl.activeVisualPipeline;
    if(p == '') $scope.activeVisual.pipeline = null;
    else if(p == 'vdeNewPipeline') {
      $scope.activeVisual.pipeline = new vde.Vis.Pipeline();
      $rootScope.activePipeline = $scope.activeVisual.pipeline;
      $scope.gMdl.activeVisualPipeline = $scope.activeVisual.pipeline.name;
    }
    else $scope.activeVisual.pipeline = vde.Vis.pipelines[p];
  };

});