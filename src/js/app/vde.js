var vde = {version: '0.0.5'};

vde.App = angular.module('vde', ['ui.inflector']);

vde.App.controller('ExportCtrl', function($scope, $rootScope) {
  $scope.eMdl = {};

  $scope.export = function() {
    $scope.eMdl.spec = JSON.stringify(vde.Vis.parse(false), null, 2);
  };
});

vde.App.directive('vdeDraggable', function() {
  return function(scope, element, attrs) {
    element
      .drag('start', function(e, dd) {
        if(!$(this).hasClass('mark')) {
          $(dd.available).each(function(i, a) {
            // Only light up properties without nodrop
            if(!$(a).hasClass('property')) return;
            if($(a).parent().attr('nodrop')) return;

            $(a).addClass('available');
          })
        }

        return $(this).clone(true, true)
            .addClass('proxy')
            .css('opacity', 0.75)
            .css('position', 'absolute')
            .css('z-index', 100)
            .appendTo(document.body);
      })
      .drag(function(e, dd){
        $(dd.proxy).css({ top: dd.offsetY, left: dd.offsetX });
      })
      .drag("end",function(e, dd){ 
        $(dd.available).removeClass('available');
        $( dd.proxy ).remove(); 
      });
  }
});

vde.App.directive('vdeClearBubbles', function($rootScope) {
  return function(scope, element, attrs) {
    element.click(function() {
      $rootScope.activeScale = null;
      $('#binding-inspector').hide();

      $rootScope.previewTransformIdx = null;
      $rootScope.editVis = false;
    })
  };
});

vde.App.directive('vdeTooltip', function() {
  return function(scope, element, attrs) {
    element.tooltip({
      title: attrs.vdeTooltip,
      placement: 'bottom',
      delay: { show: 300, hide: 150 },
      container: 'body'
    });
  };  
})