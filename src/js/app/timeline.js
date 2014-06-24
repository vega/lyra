vde.App.factory('timeline', ["$rootScope", "$timeout", "$indexedDB", "$q", "Vis", "iVis",
  function($rootScope, $timeout, $indexedDB, $q, Vis, iVis) {
    // We can't let the timeline grow too large because it'll all our RAM.
    var timelineLimit = 25;

    return {
      timeline: [],
      currentIdx: -1,
      fileName: null,
      tutorial: false,  // If in tutorial mode, don't truncate to timelineLimit

      files: function() {
        return $indexedDB.objectStore('files');
      },

      open: function(fileName) {
        var deferred = $q.defer(), timeline = this;

        this.files().find(fileName).then(function(file) {
          timeline.fileName   = file.fileName;
          timeline.timeline   = file.timeline;
          timeline.currentIdx = file.timeline.length - 1;

          timeline.redo();
          deferred.resolve(file);
        });

        return deferred.promise;
      },

      store: function() {
        var deferred = $q.defer();
        var vis = Vis.export(true);
        var app = this.timeline[this.timeline.length - 1].app;

        this.files().upsert({
          fileName: this.fileName,
          timeline: [{ vis: vis, app: app }],
          currentIdx: this.currentIdx
        }).then(function(e) { deferred.resolve(e); });

        return deferred.promise;
      },

      delete: function(name) {
        var deferred = $q.defer();

        this.files().delete(name)
            .then(function(e) { deferred.resolve(e); });

        return deferred.promise;
      },

      save: function() {
        var vis = Vis.export(false);
        delete vis._data;

        this.timeline.length = ++this.currentIdx;
        this.timeline.push({
          vis: vis,
          app: {
            activeVisual: ($rootScope.activeVisual || {}).name,
            isMark: $rootScope.activeVisual instanceof Vis.Mark,
            isGroup: $rootScope.activeVisual instanceof Vis.marks.Group,
            activeLayer: ($rootScope.activeLayer||{}).name,
            activeGroup: ($rootScope.activeGroup||{}).name,
            activePipeline: ($rootScope.activePipeline||{}).name
          }
        });

        if(this.timeline.length > timelineLimit && !this.timeline.tutorial) {
          this.timeline.splice(0, this.timeline.length - timelineLimit);
          this.currentIdx = this.timeline.length - 1;
        }
      },

      load: function(idx) {
        var t = this.timeline[idx], vis = t.vis, app = t.app;
        var digesting = ($rootScope.$$phase || $rootScope.$root.$$phase);

        var f = function() {
          $rootScope.groupOrder = Vis.groupOrder = [];
          Vis.import(vis).then(function() {
            if(app.activeLayer) {
              var g = Vis.groups[app.activeLayer];
              if(app.activeGroup && app.activeLayer != app.activeGroup)
                g = g.marks[app.activeGroup];

              if(app.activeVisual) {
                $rootScope.toggleVisual(app.isMark ? app.isGroup ? g :
                    g.marks[app.activeVisual] : g.axes[app.activeVisual], 0, true);
              } else {
                // If we don't have an activeVisual, clear out any interactors
                iVis.activeMark = null;
                iVis.show('selected');
              }
            }

            if(app.activePipeline)
              $rootScope.togglePipeline(Vis.pipelines[app.activePipeline], true);
          });
        };

        digesting ? f() : $rootScope.$apply(f);
      },

      undo: function() {
        this.currentIdx = (--this.currentIdx < 0) ? 0 : this.currentIdx;
        this.load(this.currentIdx);
      },

      redo: function() {
        this.currentIdx = (++this.currentIdx >= this.timeline.length) ?
            this.timeline.length - 1 : this.currentIdx;
        this.load(this.currentIdx);
      }

    };
}]);

vde.App.controller('TimelineCtrl', function($scope, $rootScope, $window, timeline, $timeout) {
  var t = function() {
    return {
      length: timeline.timeline.length,
      idx: timeline.currentIdx,
      fileName: timeline.fileName
    };
  };

  $scope.$watch(function() {
    return t();
  }, function() {
    $scope.timeline = t();
  }, true);

  var files = function() {
    $scope.files = [];
    timeline.files().getAll().then(function(files) {
      $scope.files = files.map(function(f) { return f.fileName; });
    });
  };

  files();
  $scope.tMdl = {fileName: null};

  $scope.showOpen = function() {
    $rootScope.fileOpenPopover = !$rootScope.fileOpenPopover;
    $rootScope.fileSavePopover = false;
    $rootScope.exportPopover   = false;
  };

  $scope.open = function(name) {
    timeline.open(name).then(function() {
      $rootScope.fileOpenPopover = false;
    });
  };

  $scope.save = function() {
    if(!$scope.timeline.fileName) {
      $rootScope.fileOpenPopover = false;
      $rootScope.fileSavePopover = !$rootScope.fileSavePopover;
      $rootScope.exportPopover   = false;
    } else {
      timeline.fileName = $scope.timeline.fileName;
      timeline.store().then(function() {
        $rootScope.fileSavePopover = false;
        $timeout(function() { files(); }, 100);
      });
    }
  };

  $rootScope.closeTimelinePopovers = function() {
    $rootScope.fileOpenPopover = false;
    $rootScope.fileSavePopover = false;
    $rootScope.exportPopover   = false;
  };

  $scope.delete = function(name) {
    timeline.delete(name).then(function() {
      $timeout(function() { files(); }, 100);
    });
  };

  $scope.undo = function() { timeline.undo(); };
  $scope.redo = function() { timeline.redo(); };

  $window.addEventListener('keydown', function(keyEvent) {
    var keyCode = keyEvent.keyCode;

    if (keyEvent.metaKey === true || keyEvent.ctrlKey === true) {
      if (keyCode === 89) {
        $scope.$apply(function() { $scope.redo(); });
        keyEvent.preventDefault();
        return false;
      }
      else if (keyCode === 90) {
        //special case (CTRL-SHIFT-Z) does a redo (on a mac for example)
        if (keyEvent.shiftKey === true) {
          $scope.$apply(function() { $scope.redo(); });
        }
        else {
          $scope.$apply(function() { $scope.undo(); });
        }
        keyEvent.preventDefault();
        return false;
      }
    }
  });
});