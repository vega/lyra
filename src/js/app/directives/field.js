vde.App.directive('vdeField', function(Vis) {
  return {
    scope: { vdeField: '=' },
    link: function(scope, element, attrs) {
      scope.$watch('vdeField', function() {
        if(scope.vdeField instanceof Vis.Field) 
          element.data('field', scope.vdeField)
            .attr('field-spec', scope.vdeField.spec());
      });
    }
  }
});