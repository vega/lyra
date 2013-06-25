var vde = {version: '0.0.5'};

vde.App = angular.module('vde', []);

vde.App.controller('VdeCtrl', function($scope) {
  $scope.parse = function() { vde.Vis.parse(); }
});