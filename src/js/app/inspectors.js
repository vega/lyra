vde.App.controller('InspectorsCtrl', function($scope, $rootScope, $routeParams, $location) {
  if('groupName' in $routeParams) {
    var group = vde.Vis.groups[$routeParams.groupName];
    $rootScope.activeGroup = group.name;

    // TODO: Deal with pseudo-groups and subgroups. 
    if('itemName' in $routeParams) {
      var path = $location.path();
      var type, types, item;
      if(path.indexOf('mark') != -1) { // TODO: This is ugly. Fix routes. 
        type  = 'mark';
        types = 'marks';
      } else if(path.indexOf('axis') != -1) {
        type  = 'axis';
        types = 'axes'
      } else {
        type  = 'scale';
        types = 'scales';
      }
      
      if($routeParams.itemName == 'new')
        item = (type == 'scale') ? new vde.Vis.Scale('', group) : new vde.Vis.Axis('', group);
      else
        item = group[types][$routeParams.itemName];

      $rootScope.itemName = item.name;
      $rootScope.itemType = type;
      $scope.item       = item;
      $scope.properties = item.properties;
      $scope.fullWidth  = (type == 'axis');
    } else {
      $rootScope.itemName = group.name;
      $rootScope.itemType = 'group';
      $scope.item       = group;
      $scope.properties = group.properties;
    }
  } else {
    $rootScope.activeGroup = undefined;
    $rootScope.itemType = 'visualization';
    $scope.properties = vde.Vis.properties;
  };
});

vde.App.controller('InspectorsStubCtrl', function($scope, $routeParams) {
  var mark = vde.Vis.groups[$routeParams.groupName]['marks'][$routeParams.itemName];
  $scope.templateUrl = 'tmpl/inspectors/' + mark.type + '.html';
});

vde.App.directive('vdeProperty', function() {
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
      nodrop: '@'
    },
    transclude: true,
    templateUrl: 'tmpl/inspectors/property.html',
    controller: function($scope, $element, $attrs, $timeout) { 
      $scope.onchange = function() {
        $timeout(function() {
          // if($scope.item.updateProps) {
          //   $scope.item.updateProps()
          //   vde.Vis.view.update();
          // }
          // else
            vde.Vis.parse();
        }, 100);        
      };

      $scope.unbind = function(property) {
        $scope.item.unbindProperty(property);
        vde.Vis.parse();
      }
    },
    link: function(scope, element, attrs) {
      if(attrs.nodrop) return;
      if(attrs.type == 'expr') return;

      $(element).find('.property').drop(function(e, dd) {
        var isField = $(dd.proxy).hasClass('schema');
        var value = $(dd.proxy).attr('field') || $(dd.proxy).find('.scale').attr('scale');

        scope.$apply(function() {
          scope.item.bindProperty(attrs.property, 
            isField ? {field: value} : {scaleName: value});
        });

        $('.proxy').remove();

        vde.Vis.parse();
      }).drop('dropstart', function() {
        $(this).css('backgroundColor', '#bbb');
      }).drop('dropend', function() {
        $(this).css('backgroundColor', 'transparent');
      })
    }
  }
});

vde.App.directive('vdeBinding', function($compile) {
  return {
    restrict: 'E',
    scope: {
      scale: '=',
      field: '=',
      draggableScale: '@',
    },
    templateUrl: 'tmpl/inspectors/binding.html',
    controller: function($scope, $element, $attrs) {
      if(!$attrs.draggableScale) return;

      var el = $compile("<div class=\"binding-draggable\" vde-draggable></div>")($scope);
      $element.append(el);
    },
    link: function(scope, element, attrs) {
      if(!attrs.draggableScale) return;

      var binding = element.find('.binding');
      element.find('.binding-draggable').append(binding);
    }
  }
});

vde.App.directive('vdeExpr', function() {
  return {
    restrict: 'A',
    template: '<div class="expr" contenteditable="true"></div>',
    link: function(scope, element, attrs) {
      $(element).find('.expr')
        .html(scope.$parent.ngModel)
        .drop(function(e, dd) {
          var field = $(dd.proxy).attr('field');
          if(!field) return;

          $('<div class="schema" contenteditable="false">' + $(dd.proxy).text() + '</div>')
            .attr('field', field)
            .toggleClass('raw',     $(dd.proxy).hasClass('raw'))
            .toggleClass('derived', $(dd.proxy).hasClass('derived'))
            .appendTo(this);

          $('.proxy').remove();
          $(this).focus();
        }).drop('dropstart', function() {
          $(this).parent().css('borderColor', '#333');
        }).drop('dropend', function() {
          $(this).parent().css('borderColor', '#aaa');
        })
        .bind('keyup', function(e) {
          var html  = $(this).html().replace('<br>','');
          var value = $('<div>' + html + '</div>');
          value.find('.schema').each(function(i, e) {
            $(e).text('d.' + $(e).attr('field'));
          });

          scope.$apply(function() {
            scope.item.properties[scope.property] = value.text();
            scope.item.properties[scope.property + 'Html'] = html;
          });
        })    
    }
  }
})