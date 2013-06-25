vde.App.controller('MarksCtrl', function($scope, $rootScope) {
  $scope.marks = ['Rect', 'Arc'];
});

vde.App.directive('markDraggable', function() {
  return function(scope, element, attrs) {
    element.bind('dragstart', function(e) {
      e.dataTransfer.effectAllowed = 'copy';
      e.dataTransfer.setData('markType', attrs['id']);
    })
  }
})

vde.App.directive('markDroppable', function($rootScope, $location) {
  return function(scope, element, attrs) {
    element.bind('dragenter', function(e) { e.preventDefault(); return false; })
      .bind('dragover', function(e) { e.preventDefault(); return false; })
      .bind('drop', function(e) {
        var markType = e.dataTransfer.getData('markType');
        if(!markType) return false;

        var activeGroup = $rootScope.activeGroup;

        scope.$apply(function() {
          // Add mark to model, then reparse vega spec
          var group = vde.Vis.groups[activeGroup];
          var mark = eval('new vde.Vis.marks["' + markType + '"](undefined, group)');
          vde.Vis.parse();

          // Then route to this mark to load its inspector
          $location.path('/group/' + activeGroup + '/rect/' + mark.name);
        });
      })
  }
})