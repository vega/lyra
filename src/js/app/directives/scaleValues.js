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