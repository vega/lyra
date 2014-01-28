vde.App.directive('vdeProperty', function($rootScope, logger, timeline) {
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
      nochange: '@',
      hint: '@'
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

          timeline.save();
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

        timeline.save();
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
        dd.proxy = null;
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
      draggable: '@'
    },
    templateUrl: 'tmpl/inspectors/binding.html',
    controller: function($scope, $element, $attrs) {
      // if($attrs.draggable) {
        var el = $compile("<div class=\"binding-draggable\" vde-draggable></div>")($scope);
        $element.append(el);
      // }

      $rootScope.aggregate = function(stat) {
        var field = $rootScope.activeField;
        field.pipeline().aggregate(field, stat);
        $timeout(function() { vde.Vis.parse(); }, 1);
        $('#aggregate-inspector').hide();

        timeline.save();
      };

      $scope.editBinding = function(evt, part) {
        var inspector = null;
        if(part == 'scale') {
          inspector = $('#binding-inspector');
          $rootScope.activeScale = inspector.is(':visible') ? null : $scope.scale;
          vde.iVis.parse($rootScope.activeScale); // Visualize scale
        } else {
          inspector = $('#aggregate-inspector');
          $rootScope.activeField = inspector.is(':visible') ? null : $scope.field;
        }

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

vde.App.directive('vdeExpr', function($rootScope, $compile, $timeout, logger) {
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
      var parse = function() {
        var elem = $(element).find('.expr');
        var html  = elem.html().replace('<br>','');
        var value = $('<div>' + html + '</div>');
        var strConcat = (attrs.vdeExpr == 'str');
        var digesting = (scope.$$phase || scope.$root.$$phase);

        // When we add a transform containing an expr to the pipeline, the references
        // change and this function is called before .expr.html() is rendered correctly.
        if(digesting && html == "") return;

        value.find('.schema').each(function(i, e) {
          if(strConcat) $(e).text('" + d.' + $(e).attr('field-spec') + ' + "');
          else          $(e).text('d.' + $(e).attr('field-spec'));
        });

        var applyProperties = function() {
          scope.item.properties[scope.property] = strConcat ? '"' + value.text() + '"' : value.text();
          scope.item.properties[scope.property + 'Html'] = html;

          scope.$parent.onchange();
          vde.Vis.parse();
        };

        // Safe apply in case parse is called from within a watch.
        digesting ? applyProperties() : scope.$apply(applyProperties);
      };

      $(element).find('.expr')
        // .html(scope.$parent.ngModel)
        .drop(function(e, dd) {
          var proxy = vde.iVis.dragging, expr = this;
          var field = $(proxy).data('field') || $(proxy).find('.schema').data('field') || $(proxy).find('.schema').attr('field');
          if(!field) return;

          if(scope.item instanceof vde.Vis.Transform &&
            !scope.item.requiresFork && field instanceof vde.Vis.Field)
              scope.item.requiresFork = ($rootScope.activePipeline.name != field.pipelineName);

          var bindingScope = $rootScope.$new();
          bindingScope.field = new vde.Vis.Field(field);
          scope.item.exprFields.push(bindingScope.field);
          var binding = $compile('<vde-binding style="display: none" field="field"></vde-binding>')(bindingScope);
          scope.$apply();

          $(this).append(binding.find('.schema').attr('contenteditable', 'false'));

          if(dd) dd.proxy = null;
          $('.proxy').remove();
//          parse();
          $(this).focus();
        }).drop('dropstart', function() {
          $(this).parent().css('borderColor', '#333');
        }).drop('dropend', function() {
          $(this).parent().css('borderColor', '#aaa');
        })
        .bind('keyup', function(e) { parse(); })
        .bind('click', function() { $(this).focus(); });

      // This captures any aggregation changes made to the fields used. We need to set it on
      // a timeout because parse requires the html of element to have been completely rendered.
      scope.$watch('item.exprFields', function() { $timeout(function() { parse() }, 100) }, true);

      // NgModel is registered on the top-level directive. We need this to move the value of
      // the model into our editable div.
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
