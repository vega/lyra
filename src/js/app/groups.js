vde.App.controller('GroupsCtrl', function($scope, $rootScope, $location) {
  $scope.groups = vde.Vis.groups;

  $scope.activateGroup = function(groupName) {
    $rootScope.activeGroup = groupName;

    // Route to this group to load its inspector
    $location.path('/group/' + groupName);
  }
});