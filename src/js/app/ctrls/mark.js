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