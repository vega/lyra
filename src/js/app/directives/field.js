vde.App.directive('vdeField', function(Vis) {
  return {
    scope: { vdeField: '=' },
    link: function(scope, element) {
      var isField = scope.vdeField instanceof Vis.Field;

      scope.$watch(function(scope) { 
        return isField ? scope.vdeField.spec() : false;
      }, function() {
        if(isField)
          element.data('field', scope.vdeField)
            .attr('field-spec', scope.vdeField.spec());
      });
    }
  };
});