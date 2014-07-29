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
        };
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
            Vis.parse().then(function() {
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
          return {
            p: $scope.property, 
            b: $scope.extentsBound,
            v: $scope.extentsProps.map(function(p) { 
              return $scope.item.properties[p.property]; 
            })
          };
        }, function(newVal, oldVal) {
          console.log("vals", vg.duplicate(newVal), vg.duplicate(oldVal));
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

            Vis.parse();
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
      });
    }
  };
});