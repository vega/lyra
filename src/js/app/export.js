vde.App.controller('ExportCtrl', function($scope, $rootScope, timeline, $window) {
  $rootScope.export = function(evt) {
    var makeFile = function(data, type) {
      var blob = new Blob([data], {type: type});
      var url = $window.webkitURL || $window.URL;
      return url.createObjectURL(blob);
    };

    $scope.fileName = timeline.fileName || 'lyra';
    $scope.inlinedValues = makeFile(JSON.stringify(vde.Vis.parse(), null, 2), 'text/json');
    $scope.refData = makeFile(JSON.stringify(vde.Vis.parse(false), null, 2), 'text/json');

    $('#export-popover').css({ left: (evt.pageX - 130) }).toggle();
  };

  $scope.close = function() {
    $('#export-popover').hide();
  }
});