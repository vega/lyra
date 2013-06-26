vde.App.controller('GroupsCtrl', function($scope, $rootScope, $location) {
  $scope.groups = vde.Vis.groups;

  $scope.toggleGroup = function(groupName) {
    if($rootScope.activeGroup == groupName)
      $location.path('/');
    else
      $location.path('/group/' + groupName);
  }
});