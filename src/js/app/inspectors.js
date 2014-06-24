vde.App.directive('vdeProperty', function($rootScope, timeline, Vis, iVis, vg) {
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
      ngModel: '=?',
      scale: '=?',
      field: '=?',
      options: '=?',
      nodrop: '@',
      canDropStyle: '@',
      nochange: '@',
      hint: '@',
      hintUrl: '@',
      style: '@',
      extentsProps: '=?',
      extentsBound: '=?',
      imgFill: '@'
    },
    transclude: true,
    templateUrl: function(tElement, tAttrs) {
      var tmpl = 'tmpl/inspectors/property';
      if(tAttrs.imgFill) return tmpl + '-imgfill.html';
      if(tAttrs.extentsProps) return tmpl + '-extents.html';

      return tmpl + '.html';
    },
    controller: function($scope, $element, $attrs, $timeout) {
      $scope.fillTypes = [{label: 'Color', property: 'color'},
        {label: 'Image', property: 'image'}];

      // We can't simply check for $scope.scale or $scope.field because of
      // the extents properties. So use this instead.
      $scope.getScale = function() {
        var prop = (($scope.item||{}).properties||{})[$scope.property];
        return $scope.scale || (prop ? prop.scale : false);
      };

      $scope.getField = function() {
        var prop = (($scope.item||{}).properties||{})[$scope.property];
        return $scope.field || (prop ? prop.field : false);
      };

      $scope.$watch(function($scope) {
        return {
          property: $scope.property,
          scale: $scope.getScale(),
          field: $scope.getField()
        }
      }, function() {
        var scale = $scope.getScale();
        if(scale && scale.properties.type == 'ordinal') {
          var domain = scale.field(), field = $scope.getField();

          if(field) {
            $scope.fieldMatchesDomain = (domain instanceof Vis.Field) ?
                field.spec() == domain.spec() : false;
          } else if(!scale.pipeline().forkName) {
            $scope.values = (domain instanceof Vis.Field) ?
                scale.pipeline().values().map(vg.accessor(domain.spec())).concat(['auto']) :
                domain;
          }
        }
      }, true);

      $scope.onchange = function(prop) {
        if(!prop) prop = $scope.property;
        if($attrs.nochange) return;
        if('checkExtents' in $scope.item)
          $scope.item.checkExtents(prop);

        // X/Y-Axis might be added by default if fields dropped over dropzones.
        // If the user toggles to them, assume they're going to edit, and delete
        // default flag to prevent the axis from being overridden by future drops.
        if($scope.item instanceof Vis.Axis) delete $scope.item.default;

        // For non-layer groups, if any of the spatial properties are changed
        // then switch the layout to overlapping.
        if(['x', 'x2', 'width', 'y', 'y2', 'height'].indexOf(prop) != -1 &&
            $scope.item.type == 'group' && !$scope.item.isLayer())
          $scope.item.layout = Vis.transforms.Facet.layout_overlap;

        $timeout(function() {
          if($scope.item.update) {
            $scope.item.update(prop);
            iVis.show('selected');
            timeline.save();
          } else {
            Vis.parse().then(function(spec) {
              iVis.show('selected');
              timeline.save();
            });
          }
        }, 1);
      };

      $scope.unbind = function(property) {
        if(!property) property = $scope.property;
        $scope.item.unbindProperty(property);
        Vis.parse().then(function() { timeline.save(); });
      };

      $scope.unInferProperty = function(property, field) {
        $scope.item.bindProperty(property, {
          field: field,
          pipelineName: field.pipelineName
        });
      };

      $scope.showHelper = function(target, e, helperClass) {
        if($scope.item instanceof Vis.Mark) $scope.item.helper($scope.property);

        target.addClass(helperClass);
      };

      $scope.hideHelper = function(target, e, helperClass) {
        target.removeClass(helperClass);
        if(target.hasClass('helper') || target.hasClass('drophover')) return;

        if(!iVis.dragging) iVis.show('selected');
        else if($rootScope.activeVisual instanceof Vis.Mark)
          $rootScope.activeVisual.propertyTargets();
      };

      // This block of code ensures that the extent selects stay in sync.
      if($scope.extentsProps) {
        $scope.$watch(function($scope) {
          return {p: $scope.property, b: $scope.extentsBound,
            v: $scope.extentsProps.map(function(p) { return $scope.item.properties[p.property]; })}
        }, function(newVal, oldVal) {
          $scope.properties = [];

          if(newVal.p != oldVal.p) {
            if(newVal.p) {
              delete $scope.item.properties[newVal.p].disabled;
              $scope.extentsBound[newVal.p] = 1;
            }

            if(oldVal.p) {
              $scope.item.properties[oldVal.p].disabled = true;
              delete $scope.extentsBound[oldVal.p];
            }
          }

          // This happens if a production rule disables the current property.
          if(newVal.p && $scope.item.properties[newVal.p].disabled) {
            newVal.p = null;
            $scope.property = null;
          }

          $scope.extentsProps.forEach(function(prop) {
            var p = prop.property, bind = false;
            if($scope.item.properties[p].disabled) bind = true;
            else if(newVal.p == p) bind = true;
            else {
              if(!newVal.p && !$scope.property && !(p in $scope.extentsBound)) {
                $scope.property = p;
                $scope.extentsBound[p] = 1;
                bind = true;
              }
              if(!(p in $scope.extentsBound)) bind = true;
            }

            if(bind) $scope.properties.push(prop);
          });
        }, true);
      }
    },
    link: function(scope, element, attrs) {
      if(attrs.nodrop) return;

      $(element).find('.property, .canDropField').on('mousemove', function(e) {
        scope.showHelper($(this), e, 'helper');
      }).on('mouseleave', function(e) {
        scope.hideHelper($(this), e, 'helper');
      }) // Clear helpers
      .drop(function(e, dd) {
        if(element.find('.expr').length > 0) return element.find('.expr').drop(e, dd);
        if($rootScope.activeScale && $rootScope.activeScale != scope.item) return;

        iVis.bindProperty(scope.item, scope.property);
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

vde.App.directive('vdeBinding', function($compile, $rootScope, $timeout, timeline, Vis, iVis) {
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
    link: function(scope, element, attrs) {
      // if(attrs.draggable) {
        var binding = element.find('.binding');
        element.find('.binding-draggable').append(binding);
      // }
      $timeout(function() {
        if(scope.field instanceof Vis.Field)
          element.find('.schema').data('field', scope.field);
      }, 100)
    }
  }
});

vde.App.directive('vdeExpr', function($rootScope, $compile, $timeout, timeline, Vis) {
  return {
    restrict: 'A',
    scope: {
      item: '=',
      property: '=',
      ngModel: '=',
      vdeExpr: '@'
    },
    template: '<vde-can-drop-field style="right"></vde-can-drop-field><div class="expr" contenteditable="true"></div>',
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

          Vis.parse();
        };

        // Safe apply in case parse is called from within a watch.
        digesting ? applyProperties() : scope.$apply(applyProperties);
      };

      $(element).find('.expr')
        // .html(scope.$parent.ngModel)
        .drop(function(e, dd) {
          var proxy = iVis.dragging, expr = this;
          var field = $(proxy).data('field') || $(proxy).find('.schema').data('field') || $(proxy).find('.schema').attr('field');
          if(!field) return;

          if(scope.item instanceof Vis.Transform &&
            !scope.item.requiresFork && field instanceof Vis.Field)
              scope.item.requiresFork = ($rootScope.activePipeline.name != field.pipelineName);

          var bindingScope = $rootScope.$new();
          bindingScope.field = new Vis.Field(field);
          scope.item.exprFields.push(bindingScope.field);
          var binding = $compile('<vde-binding style="display: none" field="field"></vde-binding>')(bindingScope);
          scope.$apply();

          if(scope.item.properties.textFormulaHtml == "Text"){
            //If the text is currently just the default value, clear text
            $(this).text("");
          }

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

      $(element).bind('click', function() { $(this).find('.expr').focus(); });

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
      }
    }
  }
});

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
      scope.edit = function() {
        element.attr('contentEditable', true);
        element.focus();
      };

      // If it's a property value (e.g. color or slider val), click on the property span
      if(element.parent().prop('tagName') != 'H3'){
        element.on('click',scope.edit);
      }





      element.on('blur keydown', function(evt) {
        if(!evt.keyCode || (evt.keyCode && evt.keyCode == 13))
          element.attr('contentEditable', false);
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

vde.App.directive('vdeScaleValues', function(Vis, vg) {
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
        Vis.parse();
      }

      $scope.add = function(evt, button) {
        if((evt && evt.keyCode != 13) && !button) return;
        $scope.values.push({ value: $scope.newValue });
        $scope.update();
        $scope.newValue = '';
      };

      $scope.deleteIfEmpty = function($index) {
        if($scope.values[$index].value == '') $scope.values.splice($index, 1);
        $scope.update();
      };

      $scope.delete = function($index){
        $scope.values.splice($index, 1);
        $scope.update()
      }
    }
  }
});

vde.App.directive('vdeInferredPopover', function($timeout) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var canDropField = element.parent().find('.canDropField');
      var dropOffset = canDropField.offset();
      var threshold = $('#groups-list').offset().left + $('#groups-list').width()/2 - 10;

      // Position the popover above the nearest .canDropField
      element.removeClass('bottom-left bottom-right')
          .addClass(dropOffset.left > threshold ? 'bottom-right' : 'bottom-left')
          .css({ top: (dropOffset.top - 60), left: 10 });

      // Fade out the popover after a few seconds, but if the user mouses
      // in/out, restart the fading timer. If we fade out, then that implies
      // the user is ok with the inference, so clear out the inference flag.
      var fadeOut = function() {
        return $timeout(function() {
          element.fadeOut();
          delete scope.item.properties[scope.property].inferred;
        }, 3000);
      };

      var f = fadeOut();
      element.on('click mouseover', function() { $timeout.cancel(f); })
        .on('mouseleave', function() { f = fadeOut(); });
    }
  }
})
