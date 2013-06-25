vde.App.controller('MarksCtrl', function($scope) {
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

vde.App.directive('markDroppable', function() {
  return function(scope, element, attrs) {
    element.bind('dragenter', function(e) { e.preventDefault(); return false; })
      .bind('dragover', function(e) { e.preventDefault(); return false; })
      .bind('drop', function(e) {
        var markType = e.dataTransfer.getData('markType');
        if(!markType) return false;

        var mark = eval('new vde.Vis.marks["' + markType + '"]()');
        vde.Vis.parse();
      })
  }
})