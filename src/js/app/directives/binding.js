vde.App.directive('vdeBinding', function($compile, $rootScope, $timeout, timeline, Vis, iVis) {
  return {
    restrict: 'E',
    scope: {
      scale: '=',
      field: '=',
      draggable: '@'
    },
    templateUrl: 'tmpl/inspectors/binding.html',
    controller: function($scope) {
      // if($attrs.draggable) {
//        var el = $compile("<div class=\"binding-draggable\" vde-draggable></div>")($scope);
//        $element.append(el);
      // }

      $rootScope.aggregate = function(stat) {
        var field = $rootScope.activeField;
        field.pipeline().aggregate(field, stat);
        $timeout(function() {
          Vis.parse().then(function() {
            $('#aggregate-popover').hide();
            timeline.save();
          });
        }, 1);
      };

      $scope.editBinding = $rootScope.editBinding = function(evt, part) {
        var inspector = null;
        var winHeight = $(window).height(), winWidth = $(window).width(),
            pageX = evt.pageX, pageY = evt.pageY;

        if(part == 'scale') {
          inspector = $('#scale-popover');
          $rootScope.activeScale = inspector.is(':visible') ? null : $scope.scale;
          iVis.parse($rootScope.activeScale); // Visualize scale
        } else {
          inspector = $('#aggregate-popover');
          $rootScope.activeField = inspector.is(':visible') ? null : $scope.field;
        }

        $timeout(function() {
          inspector.css('left', (pageX-15) + 'px');
          inspector.removeClass('top bottom left right top-left top-right bottom-left bottom-right');
          var className = '';

          if(pageX > winWidth/2) {
            inspector.css('left', (pageX - inspector.width() - 20) + 'px');
            className += 'left left-';
          } else {
            inspector.css('left', (pageX + 20) + 'px');
            className += 'right right-';
          }

          if(pageY > winHeight / 2) {
            inspector.css('top', (pageY - inspector.height() + 15) + 'px');
            className += 'top';
          } else {
            inspector.css('top', pageY - 20 + 'px');
            className += 'bottom';
          }

          inspector.addClass(className);
          inspector.toggle();
        }, 100);
      };
    },
    link: function(scope, element) {
      // if(attrs.draggable) {
        var binding = element.find('.binding');
        element.find('.binding-draggable').append(binding);
      // }
      $timeout(function() {
        if(scope.field instanceof Vis.Field)
          element.find('.schema').data('field', scope.field);
      }, 100);
    }
  };
});