vde.App.directive('vdeProperty', function($rootScope, logger) {
  return {
    restrict: 'E',
    scope: {
      label: '@',
      type: '@',
      max: '@',
      min: '@',
      step: '@',
      item: '=',
      property: '@',
      ngModel: '=',
      scale: '=',
      field: '=',
      options: '=',
      nodrop: '@',
      nochange: '@'
    },
    transclude: true,
    templateUrl: 'tmpl/inspectors/property.html',
    controller: function($scope, $element, $attrs, $timeout) {
      $scope.onchange = function(prop) {
        if($attrs.nochange) return;
        if('checkExtents' in $scope.item)
          $scope.item.checkExtents(prop || $scope.property);

        $timeout(function() {
          if($scope.item.update) $scope.item.update(prop || $attrs.property);
          else vde.Vis.parse();

          vde.iVis.show('selected');
        }, 1);

        logger.log('onchange', {
          item: $scope.item.name,
          group: $scope.item.groupName,
          pipeline: $scope.item.pipelineName,
          property: $attrs.property,
          ngModel: $attrs.ngModel,
          value: $scope.ngModel
        });
      };

      $scope.unbind = function(property) {
        $scope.item.unbindProperty(property);
        vde.Vis.parse();

        logger.log('unbind', {
          item: $scope.item.name,
          group: $scope.item.groupName,
          pipeline: $scope.item.pipelineName,
          property: $attrs.property,
          ngModel: $attrs.ngModel
        }, true, true);
      };

      $scope.showHelper = function(target, e, helperClass) {
        if($scope.item instanceof vde.Vis.Mark) $scope.item.helper($attrs.property);

        target.addClass(helperClass);
      };

      $scope.hideHelper = function(target, e, helperClass) {
        target.removeClass(helperClass);
        if(target.hasClass('helper') || target.hasClass('drophover')) return;

        if(!vde.iVis.dragging) vde.iVis.show('selected');
        else if($rootScope.activeVisual instanceof vde.Vis.Mark)
          $rootScope.activeVisual.propertyTargets();
      };
    },
    link: function(scope, element, attrs) {
      if(attrs.nodrop) return;

      $(element).find('.property').on('mousemove', function(e) {
        scope.showHelper($(this), e, 'helper');
      })
      .on('mouseleave', function(e) {
        scope.hideHelper($(this), e, 'helper');
      }) // Clear helpers
      .drop(function(e, dd) {
        if(element.find('.expr').length > 0) return element.find('.expr').drop(e, dd);
        if($rootScope.activeScale && $rootScope.activeScale != scope.item) return;

        vde.iVis.bindProperty(scope.item, attrs.property);
      }).drop('dropstart', function(e) {
        if($rootScope.activeScale && $rootScope.activeScale != scope.item) return;
        scope.showHelper($(this), e, 'drophover');
      }).drop('dropend', function(e) {
        if($rootScope.activeScale && $rootScope.activeScale != scope.item) return;
        scope.hideHelper($(this), e, 'drophover');
      })
    }
  }
});

vde.App.directive('vdeBinding', function($compile, $rootScope, $timeout, logger) {
  return {
    restrict: 'E',
    scope: {
      scale: '=',
      field: '=',
      draggable: '@',
    },
    templateUrl: 'tmpl/inspectors/binding.html',
    controller: function($scope, $element, $attrs) {
      // if($attrs.draggable) {
        var el = $compile("<div class=\"binding-draggable\" vde-draggable></div>")($scope);
        $element.append(el);
      // }

      $scope.editScale = function(evt) {
        var inspector = $('#binding-inspector');
        $rootScope.activeScale = inspector.is(':visible') ? null : $scope.scale;

        // Visualize scale
        vde.iVis.parse($scope.scale);

        $timeout(function() {
          var winHeight = $(window).height(), winWidth = $(window).width(),
              pageX = evt.pageX, pageY = evt.pageY;

          inspector.css('left', (pageX-15) + 'px');
          $('.bubble', inspector).removeClass('top-left top-right bottom-left bottom-right');
          var className = '';
          if(pageY > winHeight / 2) { // If below half-way, position top
            inspector.css('top', (pageY - inspector.height() - 25) + 'px');
            className = 'bottom';
          } else {
            inspector.css('top', (pageY + 25) + 'px');
            className = 'top';
          }

          if(pageX > winWidth/2) {
            inspector.css('left', (pageX - inspector.width()) + 'px');
            className += '-right';
          } else {
            inspector.css('left', (pageX - 10) + 'px');
            className += '-left';
          }

          $('.bubble', inspector).addClass(className);
          inspector.toggle();
        }, 100);

        logger.log('edit_scale', { activeScale: $rootScope.activeScale });
      };
    },
    link: function(scope, element, attrs) {
      // if(attrs.draggable) {
        var binding = element.find('.binding');
        element.find('.binding-draggable').append(binding);
      // }
      $timeout(function() {
        if(scope.field instanceof vde.Vis.Field)
          element.find('.schema').data('field', scope.field);
      }, 100)
    }
  }
});

vde.App.directive('vdeExpr', function($rootScope, logger) {
  return {
    restrict: 'A',
    scope: {
      item: '=',
      property: '=',
      ngModel: '=',
      vdeExpr: '@'
    },
    template: '<div class="expr" contenteditable="true"></div>',
    link: function(scope, element, attrs) {
      var parse = function(elem) {
        var html  = elem.html().replace('<br>','');
        var value = $('<div>' + html + '</div>');
        var strConcat = (attrs.vdeExpr == 'str');

        value.find('.schema').each(function(i, e) {
          if(strConcat) $(e).text('" + d.' + $(e).attr('field-spec') + ' + "');
          else          $(e).text('d.' + $(e).attr('field-spec'));
        });

        scope.$apply(function() {
          scope.item.properties[scope.property] = strConcat ? '"' + value.text() + '"' : value.text();
          scope.item.properties[scope.property + 'Html'] = html;

          scope.$parent.onchange();
          vde.Vis.parse();
        });
      };

      $(element).find('.expr')
        // .html(scope.$parent.ngModel)
        .drop(function(e, dd) {
          var proxy = vde.iVis.dragging;
          var field = $(proxy).data('field') || $(proxy).find('.schema').data('field') || $(proxy).find('.schema').attr('field');

          if(!field) return;

          if(scope.item instanceof vde.Vis.Transform &&
            !scope.item.requiresFork && field instanceof vde.Vis.Field)
              scope.item.requiresFork = ($rootScope.activePipeline.name != field.pipelineName);

          $('<div class="schema" contenteditable="false">' + $(proxy).text() + '</div>')
            .attr('field-spec', (field instanceof vde.Vis.Field) ? field.spec() : null)
            .toggleClass('raw',     $(proxy).hasClass('raw'))
            .toggleClass('derived', $(proxy).hasClass('derived'))
            .appendTo(this);

          $('.proxy').remove();
          parse($(this));
          $(this).focus();
        }).drop('dropstart', function() {
          $(this).parent().css('borderColor', '#333');
        }).drop('dropend', function() {
          $(this).parent().css('borderColor', '#aaa');
        })
        .bind('keyup', function(e) { parse($(this)); });

      scope.$watch(function($scope) { return $scope.ngModel },
        function() {
          var expr = $(element).find('.expr'), html = scope.ngModel;
          if(expr.html() != html) expr.html(html)
        }, true);
    }
  }
});

vde.App.directive('vdeScaleValues', function() {
  return {
    restrict: 'E',
    scope: {
      type: '@',
      scale: '=',
      property: '@',
      options: '=',
      ngModel: '='
    },
    templateUrl: 'tmpl/inspectors/scale-values.html',
    controller: function($scope, $element, $attrs) {
      $scope.values = (($scope.scale || {})[$scope.property] || []).map(function(v) { return {value: v} });

      $scope.update = function() {
        $scope.scale[$scope.property] = vg.keys($scope.values).map(function(k) { return $scope.values[k].value; });
        vde.Vis.parse();
      }

      $scope.add = function(evt, button) {
        if((evt && evt.keyCode != 13) && !button) return;
        $scope.values.push({ value: $scope.newValue });
        $scope.update();
        $scope.newValue = '';
      }

      $scope.delete = function($index) {
        if($scope.values[$index].value == '') $scope.values.splice($index, 1);
        $scope.update();
      }

      $scope.foo = function() { console.log('foo'); }
    }
  }
})
