vde.App.controller('DataCtrl', function($scope, $rootScope) {
  $scope.dMdl = {
    src: {},
    formats: ['json', 'csv', 'tsv'],
    parsings: ['string', 'number', 'boolean', 'date']
  };

  $scope.loadValues = function() {
    var src = $scope.dMdl.src;
    $scope.dMdl.isLoading = true;
    var dataModel = vg.parse.data([src], function() {
      $scope.$apply(function() {
        src.values = dataModel.load[src.name];
        src.format.parse = {};

        if(vg.isArray(src.values)) {
          for(var k in src.values[0])
            src.format.parse[k] = vg.isNumber(src.values[0][k]) ? 'number' : 'string';
        }

        $scope.dMdl.isLoading = false;
        $scope.dMdl.hasLoaded = true;
        $scope.dMdl.isObj = !vg.isArray(src.values);
        $scope.dMdl.properties = vg.keys(src.values);
      })
    }); 
  };

  $scope.add = function() {
    var src = $scope.dMdl.src;
    for(var p in src.format.parse) 
      if(src.format.parse[p] == 'string') delete src.format.parse[p];

    vde.Vis._data[src.name] = vg.duplicate(src);
    delete vde.Vis._data[src.name]['$$hashKey'];  // AngularJS pollution

    $rootScope.activePipeline.source = src.name;
    $scope.dMdl.src = {};
    $rootScope.newData = false;
  };

  $scope.cancel = function() {
    $rootScope.newData = false;
    $scope.dMdl.src = {};
    $scope.dMdl.isLoading = false;
    $scope.dMdl.hasLoaded = false;
  };

});

vde.App.directive('vdePosNewData', function () {
  return function(scope, element, attrs) {
    element.on('change', function(evt) {
      var offset = $(evt.target).offset();
      $('#new-data').css('top', (offset.top+35) + 'px');
    })
  };
});