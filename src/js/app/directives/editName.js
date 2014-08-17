vde.App.directive('vdeEditName', function() {
  return {
    restrict: 'A', // only activate on element attribute
    require: '?ngModel', // get a hold of NgModelController
    link: function(scope, element, attrs, ngModel) {
      if(!ngModel) return; // do nothing if no ng-model

      // Specify how UI should be updated
      ngModel.$render = function() {
        element.text(ngModel.$viewValue || '');
      };

      // Listen for change events to enable binding
      element.on('blur keyup change', function() {
        scope.$apply(read);
      });

      //Editing

      //For heading, user need to click the edit icon (in the template html file), which will call edit() on click.
      scope.edit = function(evt) {
        element.on('click', function(e) { 
          if(element.attr('contentEditable') === "true") e.stopPropagation();
        });
        element.attr('contentEditable', true);
        element.focus();
        if(evt) evt.stopPropagation();
      };

      // If it's a property value (e.g. color or slider val), click on the property span
      if(element.parent().prop('tagName') != 'H3'){
        element.on('click', scope.edit);
      }

      element.on('blur keydown', function(evt) {
        if(!evt.keyCode || (evt.keyCode && evt.keyCode == 13)) {
          element.attr('contentEditable', false);
        }
      });

      // Write data to the model
      function read() {
        var html = element.text();
        // When we clear the content editable the browser leaves a <br> behind
        if(html == '<br>' ) html = '';
        ngModel.$setViewValue(html);
      }
    }
  };
});