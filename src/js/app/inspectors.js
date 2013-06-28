vde.App.controller('InspectorsCtrl', function($scope, $rootScope, $routeParams) {
  if('groupName' in $routeParams) {
    var group = vde.Vis.groups[$routeParams.groupName];
    $rootScope.activeGroup = group.name;

    // TODO: Deal with pseudo-groups and subgroups. 
    if('itemName' in $routeParams) {
      var type = $routeParams.type || 'axis';
      var types = (type == 'axis') ? 'axes' : (type == 'scale') ? 'scales' : 'marks';
      var item = group[types][$routeParams.itemName];

      $rootScope.itemName = item.name;
      $rootScope.itemType = type;
      $scope.item       = item;
      $scope.properties = item.properties;
      $scope.fullWidth  = (type == 'axis');
    } else {
      $rootScope.itemName = group.name;
      $rootScope.itemType = 'group';
      $scope.item       = group;
      $scope.properties = group.properties;
    }
  } else {
    $rootScope.activeGroup = undefined;
    $rootScope.itemType = 'visualization';
    $scope.properties = vde.Vis.properties;
  }
});

vde.App.controller('InspectorsStubCtrl', function($scope, $routeParams) {
  var type = $routeParams.type || 'axis';
  var types = (type == 'axis') ? 'axes' : (type == 'scale') ? 'scales' : 'marks';

  var item = vde.Vis.groups[$routeParams.groupName][types][$routeParams.itemName];
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
      options: '=',
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