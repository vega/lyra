var vde = {version: '0.0.5'};

vde.App = angular.module('vde', ['ui.inflector', 'ui.sortable']);

vde.App.controller('VdeCtrl', function($scope, $rootScope, $timeout) {
  $scope.load = function() {
    jQuery.migrateMute = true;

    // Load defaults on a timeout to allow everything else to load.
    $timeout(function() {
      if(vg.keys(vde.Vis._rawData).length == 0) {
        vde.Vis.data('medals', 'data/medals.json', 'json');
        vde.Vis.data('olympics', 'data/olympics.json', 'json');
        // vde.Vis.data('groups', 'data/groups.json', 'json');
        vde.Vis.data('barley', 'data/barley.json', 'json');
        // vde.Vis.data('iris', 'data/iris.json', 'json');
        // vde.Vis.data('jobs', 'data/jobs.json', 'json');
        // vde.Vis.data('cities', 'data/cities.json', 'json');
        // vde.Vis.data('army', 'data/army.json', 'json');
        // vde.Vis.data('temps', 'data/temps.json', 'json');
        vde.Vis.data('trailers', 'data/trailers.json', 'json');
        vde.Vis.data('movies', 'data/movies.json', 'json');
        vde.Vis.data('characters', 'data/mis-characters.json', 'json');
        vde.Vis.data('connections', 'data/mis-connections.json', 'json');
        // vde.Vis.data('trains', 'data/trains.json', 'json');
        // vde.Vis.data('stations', 'data/stations.json', 'json');
        vde.Vis.data('unemployment', 'data/unemployment.json', 'json');
        // vde.Vis.data('wheat', 'data/wheat.json', 'json');
        // vde.Vis.data('monarchs', 'data/monarchs.json', 'json');
        // vde.Vis.data('hotels', 'data/hotels.json', 'json');
        vde.Vis.data('rundown', 'data/rundown.json', 'json');
        // vde.Vis.data('deaths', 'data/curves.json', 'json');
        // vde.Vis.data('zipcodes', 'data/zipcodes.json', 'json');
        // vde.Vis.data('stocks', 'data/stocks.csv', {"type": "csv", "parse": {"price":"number", "date":"date"}});
      }

      var g = new vde.Vis.marks.Group();
      $rootScope.activeGroup = g;

      var p = new vde.Vis.Pipeline();
      $rootScope.activePipeline = p;

      vde.Vis.parse();
    }, 1)
  };

  $scope.marks = ['Rect', 'Symbol', 'Arc', 'Area', 'Line', 'Text'];
});

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
      $('#aggregate-inspector').hide();

      $rootScope.previewTransformIdx = null;
      $rootScope.editVis = false;

      // To clear scale visualizations
      vde.iVis.parse();
    })
  };
});

vde.App.directive('vdeTooltip', function() {
  return function(scope, element, attrs) {
    element.tooltip({
      title: attrs.vdeTooltip,
      placement: 'bottom',
      // delay: { show: 300, hide: 150 },
      container: 'body'
    });
  };
});