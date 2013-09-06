vde.App.controller('MarksCtrl', function($scope, $rootScope, $timeout, logger) {
  // Cardinal sin
  $scope.load = function() {
    jQuery.migrateMute = true;

    if(vg.keys(vde.Vis._rawData).length == 0) {
      vde.Vis.data('medals', 'data/medals.json', 'json');
      vde.Vis.data('olympics', 'data/olympics.json', 'json');
      vde.Vis.data('groups', 'data/groups.json', 'json');
      vde.Vis.data('barley', 'data/barley.json', 'json');
      vde.Vis.data('iris', 'data/iris.json', 'json');
      vde.Vis.data('jobs', 'data/jobs.json', 'json');
      vde.Vis.data('cities', 'data/cities.json', 'json');
      vde.Vis.data('trailers', 'data/trailers.json', 'json');
      vde.Vis.data('movies', 'data/movies.json', 'json');
      vde.Vis.data('characters', 'data/mis-characters.json', 'json');
      vde.Vis.data('connections', 'data/mis-connections.json', 'json');
      // vde.Vis.data('stocks', 'data/stocks.csv', {"type": "csv", "parse": {"price":"number", "date":"date"}});
    }

    // Start with a default pipeline and group
    var g = new vde.Vis.marks.Group();
    $rootScope.activeGroup = g;
    $rootScope.activePipeline = new vde.Vis.Pipeline();
    vde.Vis.parse();
  };
});
