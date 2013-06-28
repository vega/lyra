vde.App.controller('MarksCtrl', function($scope, $rootScope) {
  $scope.marks = ['Rect', 'Arc'];
});

vde.App.directive('markDraggable', function() {
  return function(scope, element, attrs) {
    element
      .drag('start', function(e, dd) {
        return $(this).clone()
            .css('opacity', 0.75)
            .css('position', 'absolute')
            .css('z-index', 100)
            .appendTo(this.parentNode);
      })
      .drag(function( ev, dd ){
        $( dd.proxy ).css({
          top: dd.offsetY,
          left: (dd.offsetX - 300)
        });
      })
      .drag("end",function( ev, dd ){
        $( dd.proxy ).remove();
      });
  }
})

vde.App.directive('markDroppable', function($rootScope, $location) {
  return function(scope, element, attrs) {
    element.drop(function(e, dd) {
      var markType = $(dd.drag).attr('id');
      if(!markType) return false;

      var activeGroup = $rootScope.activeGroup;

      scope.$apply(function() {
        // Add mark to model, then reparse vega spec
        var group = vde.Vis.groups[activeGroup];
        var mark = eval('new vde.Vis.marks["' + markType + '"](undefined, group)');
        vde.Vis.parse();

        // Then route to this mark to load its inspector
        $location.path('/group/' + mark.group.name + '/mark/' + mark.name);
      });
    })
  }
})