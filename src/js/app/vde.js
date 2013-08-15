var vde = {version: '0.0.5'};

vde.App = angular.module('vde', ['ui.inflector']);

vde.App.controller('ExportCtrl', function($scope, $rootScope) {
  $scope.eMdl = {};

  $scope.export = function() {
    $scope.eMdl.spec = JSON.stringify(vde.Vis.parse(false), null, 2);
  };
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