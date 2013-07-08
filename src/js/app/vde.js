var vde = {version: '0.0.5'};

vde.App = angular.module('vde', ['ui.inflector']);

vde.App.config(function ($routeProvider) {
  $routeProvider
    .when('/', {
      template: '<ng-include src="\'tmpl/inspectors/pipeline.html\'"></ng-include> <ng-include src="\'tmpl/inspectors/vis.html\'"></ng-include>',
      controller: 'InspectorsCtrl'
    })
    .when('/group/:groupName', {
      template: '<ng-include src="\'tmpl/inspectors/pipeline.html\'"></ng-include> <ng-include src="\'tmpl/inspectors/group.html\'"></ng-include>',
      controller: 'InspectorsCtrl'
    })
    .when('/group/:groupName/axis/:itemName', {
      template: '<ng-include src="\'tmpl/inspectors/axis.html\'"></ng-include>',
      controller: 'InspectorsCtrl'
    })
    .when('/group/:groupName/:type/:itemName', {
      templateUrl: 'tmpl/inspectors/routeStub.html',
      controller: 'InspectorsStubCtrl'
    })
})

vde.App.controller('VdeCtrl', function($scope, $rootScope) {

});