vde.App.controller('GroupsCtrl', function($scope, $rootScope, $location) {
  $scope.gMdl = { // General catch-all model for scoping
    groups: vde.Vis.groups,
    pipelines: vde.Vis.pipelines
  }; 

  $scope.toggleVisual = function(v) {
    $rootScope.activeVisual = v;
    $rootScope.activeGroup  = v.group() || v;

    $rootScope.activePipeline = v.pipeline();
    $scope.gMdl.activeVisualPipeline = (v.pipeline() || {}).name;
  };  

  $scope.setPipeline = function() {
    var p = $scope.gMdl.activeVisualPipeline;
    if(p == '') $scope.activeVisual.pipelineName = null;
    else if(p == 'vdeNewPipeline') {
      var pipeline = new vde.Vis.Pipeline();
      $scope.activeVisual.pipelineName = pipeline.name
      $rootScope.activePipeline = pipeline;
      $scope.gMdl.activeVisualPipeline = pipeline.name;
    }
    else {
      $scope.activeVisual.pipelineName = p;
      $rootScope.activePipeline = vde.Vis.pipelines[p];
    }

    vde.Vis.parse();
  };

  $scope.addGroup = function() {
    var g = new vde.Vis.marks.Group();
    $rootScope.activeGroup = g;
    $rootScope.activeVisual = g;
  };

  $scope.addAxis = function() {
    var axis = new vde.Vis.Axis('', $rootScope.activeGroup.name);
    $rootScope.activeVisual = axis;
  };

  $scope.removeVisual = function(type, name) {
    var cnf = confirm("Are you sure you wish to delete this visual element?")
    if(!cnf) return;

    if(type == 'group') delete vde.Vis.groups[name];
    else delete $rootScope.activeGroup[type][name];
    vde.Vis.parse();
  };

  $scope.toggleFont = function(prop, value) {
    var p = $rootScope.activeVisual.properties[prop];
    if(p.value == value) delete p.value;
    else p.value = value;

    $rootScope.activeVisual.checkExtents(prop);

    vde.Vis.parse();
  };

  $scope.editVisualization = function() {
    $rootScope.editVis = !$rootScope.editVis;
    $rootScope.vis = vde.Vis.properties;
  };
});