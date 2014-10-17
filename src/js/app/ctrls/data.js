vde.App.controller('DataCtrl', function($scope, $rootScope, $http, timeline, Vis, vg, d3) {
  $scope.dMdl = {
    src: {},
    formats: ['json', 'csv', 'tsv'],
    parsings: ['string', 'number', 'boolean', 'date']
  };

  $scope.finishedLoading = function() {
    var src = $scope.dMdl.src;
    src.format.parse = {};

    if(vg.isArray(src.values)) {
      for(var k in src.values[0])
        src.format.parse[k] = vg.isNumber(src.values[0][k]) ? 'number' : 'string';
    }

    $scope.dMdl.isLoading = false;
    $scope.dMdl.hasLoaded = true;
    $scope.dMdl.isObj = !vg.isArray(src.values);
    $scope.dMdl.properties = vg.keys(src.values);
  };

  $scope.loadValues = function() {
    var src = $scope.dMdl.src, req = vg.duplicate(src);
    if($scope.dMdl.from == 'url') {
      req.url = 'proxy.php?url=' + encodeURIComponent(req.url);
      $scope.dMdl.isLoading = true;
      var dataModel = vg.parse.data([req], function() {
        $scope.$apply(function() {
          src.values = dataModel.load[src.name];
          $scope.finishedLoading();
        });
      });
    } else {
      var type = $scope.dMdl.src.format.type;

      if(type == 'json') {
        $scope.dMdl.src.values = JSON.parse($scope.dMdl.values);
        $scope.finishedLoading();
      }
      else {
        $scope.dMdl.src.values = d3[type].parse($scope.dMdl.values);
        $scope.finishedLoading();
      }
    }
  };

  $scope.add = function() {
    var src = $scope.dMdl.src;
    for(var p in src.format.parse) 
      if(src.format.parse[p] == 'string') delete src.format.parse[p];

    Vis._data[src.name] = vg.duplicate(src);
    delete Vis._data[src.name].$$hashKey;  // AngularJS pollution

    $rootScope.activePipeline.source = src.name;
    $scope.dMdl.src = {};
    $rootScope.newData = false;

    timeline.save();
  };

  $scope.cancel = function() {
    $rootScope.newData = false;
    $scope.dMdl.src = {};
    $scope.dMdl.isLoading = false;
    $scope.dMdl.hasLoaded = false;
  };

});