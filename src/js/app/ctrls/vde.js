/* global jQuery */
vde.App.controller('VdeCtrl', function($scope, $rootScope, $window, $timeout,
                                       $location, $http, timeline, Vis, iVis, vg) {
  $scope.load = function() {
    jQuery.migrateMute = true;

    // Load defaults on a timeout to allow everything else to load.
    $timeout(function() {
      var g = new Vis.marks.Group();
      $rootScope.activeGroup = $rootScope.activeLayer = g;

      var p = new Vis.Pipeline();
      $rootScope.activePipeline = p;

      Vis.render().then(function() {
        // Add an initial blank slate state to the timeline.
        timeline.save();

        // Watch to load example visualizations from #?example= query str 
        $scope.$watch(function() { return $location.search(); }, function() {
          var ex = $location.search().example;
          if(ex) {
            $http.get('examples/' + ex + '.json').then(function(d) {
              timeline.timeline = d.data;
              timeline.redo();
            });
          }
        }, true);

        // Only load default datasets if we've not received it elsewhere.
        if(vg.keys(Vis._rawData).length === 0) {
          Vis.data('medals', 'data/medals.json', 'json');
          Vis.data('olympics', 'data/olympics.json', 'json');
          Vis.data('groups', 'data/groups.json', 'json');
          Vis.data('barley', 'data/barley.json', 'json');
          Vis.data('iris', 'data/iris.json', 'json');
          Vis.data('jobs', 'data/jobs.json', 'json');
          Vis.data('cities', 'data/cities.json', 'json');
          Vis.data('army', 'data/army.json', 'json');
          Vis.data('temps', 'data/temps.json', 'json');
          Vis.data('trailers', 'data/trailers.json', 'json');
          Vis.data('movies', 'data/movies.json', 'json');
          Vis.data('characters', 'data/mis-characters.json', 'json');
          Vis.data('connections', 'data/mis-connections.json', 'json');
          Vis.data('trains', 'data/trains.json', 'json');
          Vis.data('stations', 'data/stations.json', 'json');
          Vis.data('unemployment', 'data/unemployment.json', 'json');
          Vis.data('wheat', 'data/wheat.json', 'json');
          Vis.data('monarchs', 'data/monarchs.json', 'json');
          Vis.data('hotels', 'data/hotels.json', 'json');
          Vis.data('rundown', 'data/rundown.json', 'json');
          Vis.data('deaths', 'data/curves.json', 'json');
          Vis.data('zipcodes', 'data/zipcodes.json', 'json');
          Vis.data('gas', 'data/gas.json', 'json');
        }
      });
    }, 500);
  };

  $scope.marks = ['Rect', 'Symbol', 'Arc', 'Area', 'Line', 'Text'];

  // Listen for messages from other applications (editor mode)
  $rootScope.editorMode = false;
  $window.addEventListener('message', function(evt) {
    // evt.data = {timeline: {}, data: {name: '', values: []}}
    var d = evt.data;
    if(!d) return;

    $rootScope.editorMode = true;

    $scope.$apply(function() {
      if(d.data) {
        Vis.data(d.data.name, d.data.values);
        $rootScope.activePipeline.source = d.data.name;
      }

      if(d.timeline) {
        timeline.timeline = d.timeline;
        timeline.currentIdx = d.timeline.length - 1
        timeline.redo();
      } else if(d.spec) {
        Vis.parse(d.spec);
      } else { 
        timeline.save();
      }
    });
  });

  // Prevent backspace from navigating back and instead delete
  $window.addEventListener('keydown', function(evt) {
    var m = iVis.activeMark;
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

  // Prompt before unloading, only if not in editor mode.
  $window.addEventListener("beforeunload", function(e) {
    // Don't prompt if we're in editor mode because, presumably, this is
    // non-destructive. 
    if($rootScope.editorMode) return; 

    var msg = 'You have unsaved changed in Lyra.';
    (e || $window.event).returnValue = msg;     //Gecko + IE
    return msg;                                 //Webkit, Safari, Chrome etc.
  });
});