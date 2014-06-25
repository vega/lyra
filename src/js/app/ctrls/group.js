vde.App.controller('GroupCtrl', function($scope, $rootScope, Vis) {
  $rootScope.$watch('groupOrder', function() {
    $scope.group = Vis.groups[$scope.layerName];
  });

  $rootScope.$watch(function($scope) {
    return {
      activeVisual: ($scope.activeVisual||{}).name,
      activeGroup: ($scope.activeGroup||{}).name,
      activeLayer: ($scope.activeLayer||{}).name
    };
  }, function() {
    $scope.boundExtents = {};
  }, true);

  $scope.xExtents = [{label: 'Start', property: 'x'},
    {label: 'Width', property: 'width'}, {label: 'End', property: 'x2'}];

  $scope.yExtents = [{label: 'Start', property: 'y'},
    {label: 'Height', property: 'height'}, {label: 'End', property: 'y2'}];
});