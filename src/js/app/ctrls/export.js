vde.App.controller('ExportCtrl', ['$scope', '$rootScope', 'timeline', '$window', 'Vis', 'vg', 'PngExporter',
  function($scope, $rootScope, timeline, $window, Vis, vg, PngExporter) {
  $rootScope.export = function() {
    var makeFile = function(data, type) {
      var blob = new Blob([data], {type: type});
      var url = $window.webkitURL || $window.URL;
      return url.createObjectURL(blob);
    };

    $scope.fileName = timeline.fileName || 'lyra';

    var spec = Vis.spec();

    vg.headless.render(
        {spec: spec, renderer: "svg", el: "#headless"},
        function(err, data) {
          if (err) throw err;
          $scope.svg = makeFile(data.svg, "image/svg+xml");
        }
    );

    $scope.png = PngExporter.get();

    $scope.inlinedValues = makeFile(JSON.stringify(spec, null, 2), 'text/json');
    $scope.refData = makeFile(JSON.stringify(Vis.spec(false), null, 2), 'text/json');

    $rootScope.fileOpenPopover = false;
    $rootScope.fileSavePopover = false;
    $rootScope.exportPopover   = !$rootScope.exportPopover;
  };
}]);

vde.App.factory('PngExporter', function() {
  return {
    get: function() {
      return $('#vis canvas')[0].toDataURL("image/png");
    }
  };
});
