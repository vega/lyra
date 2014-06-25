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