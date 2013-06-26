vde.App.controller('InspectorsCtrl', function($scope, $rootScope, $routeParams) {
  if('groupName' in $routeParams) {
    var group = vde.Vis.groups[$routeParams.groupName];
    $rootScope.activeGroup = group.name;

    // TODO: Deal with pseudo-groups and subgroups. 
    if('itemName' in $routeParams) {
      var type = $routeParams.type || 'axes';
      var item = group[type][$routeParams.itemName];

      $scope.itemName   = item.name;
      $scope.properties = item.properties;
      $scope.fullWidth  = (type == 'axes');
    } else {
      $scope.itemName   = group.name;
      $scope.properties = group.properties;
    }
  } else {
    $rootScope.activeGroup = undefined;
    $scope.properties = vde.Vis.properties;
  }
});

vde.App.controller('InspectorsStubCtrl', function($scope, $routeParams) {
  var item = vde.Vis.groups[$routeParams.groupName][$routeParams.type][$routeParams.itemName];
  $scope.templateUrl = 'tmpl/inspectors/' + item.type + '.html';
});

vde.App.directive('vdeProperty', function() {
  return {
    restrict: 'E',
    scope: {
      label: '@',
      type: '@',
      max: '@', 
      min: '@',
      step: '@',
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