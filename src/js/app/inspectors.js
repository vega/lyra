vde.App.controller('InspectorsCtrl', function($scope, $rootScope, $route, $routeParams, $location) {
  if('groupName' in $routeParams) {
    $rootScope.activeGroup = $routeParams.groupName;
  } else {
    $rootScope.activeGroup = undefined;
    $scope.properties = vde.Vis.properties;
  }
});

vde.App.directive('vdeProperty', function() {
  return {
    restrict: 'E',
    scope: {
      label: '@',
      type: '@',
      ngModel: '=',
      reparse: '@'
    },
    templateUrl: 'tmpl/inspectors/property.html',
    controller: function($scope, $element, $attrs) {
      $scope.onchange = function() {
        if($attrs.reparse) 
          vde.Vis.parse();
      }
    }
  }
});