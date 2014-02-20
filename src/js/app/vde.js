var vde = {version: 1};

vde.App = angular.module('vde', ['ui.inflector', 'ui.sortable', 'xc.indexedDB'],
    function($compileProvider, $indexedDBProvider) {
      $compileProvider.aHrefSanitizationWhitelist(/^\s*(data|blob|https?|ftp|mailto|file):/);

      $indexedDBProvider
        .connection('lyraDB')
        .upgradeDatabase(vde.version, function(event, db, tx){
          var objStore = db.createObjectStore('files', {keyPath: 'fileName'});
        });
});

vde.App.controller('VdeCtrl', function($scope, $rootScope, $window, $timeout, timeline) {
  $scope.load = function() {
    jQuery.migrateMute = true;

    // Load defaults on a timeout to allow everything else to load.
    $timeout(function() {
      if(vg.keys(vde.Vis._rawData).length == 0) {
        vde.Vis.data('medals', 'data/medals.json', 'json');
        vde.Vis.data('olympics', 'data/olympics.json', 'json');
        vde.Vis.data('groups', 'data/groups.json', 'json');
        vde.Vis.data('barley', 'data/barley.json', 'json');
        vde.Vis.data('iris', 'data/iris.json', 'json');
        vde.Vis.data('jobs', 'data/jobs.json', 'json');
        vde.Vis.data('cities', 'data/cities.json', 'json');
        vde.Vis.data('army', 'data/army.json', 'json');
        vde.Vis.data('temps', 'data/temps.json', 'json');
        vde.Vis.data('trailers', 'data/trailers.json', 'json');
        vde.Vis.data('movies', 'data/movies.json', 'json');
        vde.Vis.data('characters', 'data/mis-characters.json', 'json');
        vde.Vis.data('connections', 'data/mis-connections.json', 'json');
        vde.Vis.data('trains', 'data/trains.json', 'json');
        vde.Vis.data('stations', 'data/stations.json', 'json');
        vde.Vis.data('unemployment', 'data/unemployment.json', 'json');
        vde.Vis.data('wheat', 'data/wheat.json', 'json');
        vde.Vis.data('monarchs', 'data/monarchs.json', 'json');
        vde.Vis.data('hotels', 'data/hotels.json', 'json');
        vde.Vis.data('rundown', 'data/rundown.json', 'json');
        vde.Vis.data('deaths', 'data/curves.json', 'json');
        vde.Vis.data('zipcodes', 'data/zipcodes.json', 'json');
        vde.Vis.data('stocks', 'data/stocks.csv', {"type": "csv", "parse": {"price":"number", "date":"date"}});
      }

      var g = new vde.Vis.marks.Group();
      $rootScope.activeGroup = $rootScope.activeLayer = g;

      var p = new vde.Vis.Pipeline();
      $rootScope.activePipeline = p;

      // To be able to undo all the way back to a default/clean slate.
      vde.Vis.parse().then(function() { timeline.save(); });
    }, 500)
  };

  $scope.marks = ['Rect', 'Symbol', 'Arc', 'Area', 'Line', 'Text'];

  // Prevent backspace from navigating back and instead delete
  $window.addEventListener('keydown', function(evt) {
    var m = vde.iVis.activeMark;
    // if(!m || m.type != 'group') return;

    var preventBack = false;
    if (evt.keyCode == 8) {
      var d = evt.srcElement || evt.target;
      if (d.tagName.toUpperCase() === 'INPUT' || d.tagName.toUpperCase() === 'TEXTAREA' ||
          d.contentEditable == "true") {
        preventBack = d.readOnly || d.disabled;
      }
      else preventBack = true;
    }

    if (preventBack) {
      evt.preventDefault();
      if(m && m.type != 'group')
        $rootScope.$apply(function() { $rootScope.removeVisual('marks', m.name, m.group()); });
    }
  });

  // Prompt before unloading
  $window.addEventListener("beforeunload", function(e) {
    var msg = 'You have unsaved changed in Lyra.';
    (e || $window.event).returnValue = msg;     //Gecko + IE
    return msg;                                 //Webkit, Safari, Chrome etc.
  });
});

vde.App.controller('ScaleCtrl', function($scope, $rootScope) {
  $scope.types = ['linear', 'ordinal', 'log', 'pow', 'sqrt', 'quantile',
                  'quantize', 'threshold', 'utc', 'time', 'ref'];

  $scope.fromTypes = ['field', 'values'];
  $scope.rangeFromTypes = ['preset', 'values'];
  $scope.rangeTypes = ['spatial', 'colors', 'shapes', 'sizes', 'other'];
  $scope.axisTypes=['x', 'y'];
  $scope.nice = ['', 'second', 'minute', 'hour', 'day', 'week', 'month', 'year'];
  $scope.shapes = ['&#9724;', '&#9650;', '&#9660;', '&#11044;', '&#9830;', '&#43;'];

  $scope.deleteScale = function() {
    var scale = $rootScope.activeScale;
    if(scale.used || !scale.manual) return;

    scale.manual = false;
    vde.Vis.parse().then(function() {
      $rootScope.editBinding({}, 'scale');
    });
  }
});

vde.App.directive('vdeTooltip', function() {
  return function(scope, element, attrs) {
    element.tooltip({
      title: attrs.vdeTooltip,
      placement: attrs.position ? attrs.position : 'bottom',
      // delay: { show: 300, hide: 150 },
      container: 'body'
    });
  };
});