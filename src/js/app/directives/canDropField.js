vde.App.directive('vdeCanDropField', function() {
  return {
    restrict: 'E',
    templateUrl: 'tmpl/inspectors/can-drop-field.html',
    link: function(scope, element, attrs) {
      scope.style = attrs.style;
      scope.canUnbind = function() {
        if(scope.$parent.getScale() || scope.$parent.getField()) {
          scope.$parent.unbind();
          $('.tooltip').remove();
          return true;
        }

        return false;
      };
    }
  };
});