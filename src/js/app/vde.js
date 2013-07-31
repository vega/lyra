var vde = {version: '0.0.5'};

vde.App = angular.module('vde', ['ui.inflector']);

// vde.App.config(function ($routeProvider) {
//   $routeProvider
//     .when('/', {
//       template: '<ng-include src="\'tmpl/inspectors/pipeline.html\'"></ng-include> <ng-include src="\'tmpl/inspectors/vis.html\'"></ng-include>',
//       controller: 'InspectorsCtrl'
//     })
//     .when('/group/:groupName', {
//       template: '<ng-include src="\'tmpl/inspectors/pipeline.html\'"></ng-include> <ng-include src="\'tmpl/inspectors/group.html\'"></ng-include>',
//       controller: 'InspectorsCtrl'
//     })
//     .when('/group/:groupName/axis/:itemName', {
//       template: '<ng-include src="\'tmpl/inspectors/axis.html\'"></ng-include>',
//       controller: 'InspectorsCtrl'
//     })
//     .when('/group/:groupName/scale/:itemName', {
//       template: '<ng-include src="\'tmpl/inspectors/pipeline.html\'"></ng-include> <ng-include src="\'tmpl/inspectors/scale.html\'"></ng-include>',
//       controller: 'InspectorsCtrl'
//     })    
//     .when('/group/:groupName/mark/:itemName', {
//       templateUrl: 'tmpl/inspectors/routeStub.html',
//       controller: 'InspectorsStubCtrl'
//     })
// })

vde.App.controller('VdeCtrl', function($scope, $rootScope) {
  $scope.vMdl = {};

  $scope.export = function() {
    $scope.vMdl.spec = JSON.stringify(vde.Vis.parse(), null, 2);
  };
});

vde.App.directive('vdeDraggable', function() {
  return function(scope, element, attrs) {
    element
      .drag('start', function(e, dd) {
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
      .drag("end",function(e, dd){ $( dd.proxy ).remove(); });
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
})