vde.App.controller('GroupsCtrl', function($scope, $rootScope, $location) {
  $scope.groups = vde.Vis.groups;
  $scope.pipelines = vde.Vis.pipelines;
  $scope.gMdl = {}; // General catch-all model for scoping

  $scope.toggleVisual = function(v) {
    $rootScope.activeVisual = v;
    $rootScope.activeGroup  = v.group || v;
  };  

  $scope.setPipeline = function() {
    var p = $scope.gMdl.activeVisualPipeline;
    if(p == '') $scope.activeVisual.pipeline = null;
    else if(p == 'vdeNewPipeline') {
      $scope.activeVisual.pipeline = new vde.Vis.Pipeline();
      $rootScope.activePipeline = $scope.activeVisual.pipeline;
    }
    else $scope.activeVisual.pipeline = vde.Vis.pipelines[p];
  };

});