vde.App.factory('timeline', ["$rootScope", "$timeout", function($rootScope, $timeout) {
  var localStorageKey = 'lyraFiles';

  return {
    timeline: [],
    currentIdx: -1,
    fileName: null,

    files: function() {
      var files = JSON.parse(localStorage.getItem(localStorageKey));
      return files || {};
    },

    open: function(fileName) {
      var files = this.files();
      this.timeline = files[fileName] || [];
      this.fileName = fileName;
      this.currentIdx = this.timeline.length - 1;
    },

    store: function() {
      var files = this.files();
      files[this.fileName] = this.timeline;
      localStorage.setItem(localStorageKey, JSON.stringify(files));
    },

    delete: function(name) {
      var files = this.files();
      delete files[name];
      localStorage.setItem(localStorageKey, JSON.stringify(files));
    },

    save: function() {
      this.timeline.length = ++this.currentIdx;
      this.timeline.push({
        vis: vde.Vis.export(),
        app: {
          activeVisual: ($rootScope.activeVisual || {}).name,
          isMark: $rootScope.activeVisual instanceof vde.Vis.Mark,
          isGroup: $rootScope.activeVisual instanceof vde.Vis.marks.Group,
          activeLayer: $rootScope.activeLayer.name,
          activeGroup: $rootScope.activeGroup.name,
          activePipeline: $rootScope.activePipeline.name
        }
      });
    },

    load: function(idx) {
      var t = this.timeline[idx], vis = t.vis, app = t.app;
      var digesting = ($rootScope.$$phase || $rootScope.$root.$$phase);

      var f = function() {
        $rootScope.groupOrder = vde.Vis.groupOrder = [];
        vde.Vis.import(vis);

        // Timeout so vis has time to parse, before we switch angular/iVis
        // contexts.
        $timeout(function() {
          var g = vde.Vis.groups[app.activeLayer];
          if(app.activeLayer != app.activeGroup) g = g.marks[app.activeGroup];
          if(app.activeVisual) {
            $rootScope.toggleVisual(app.isMark ? app.isGroup ? g :
                g.marks[app.activeVisual] : g.axes[app.activeVisual]);
          } else {
            // If we don't have an activeVisual, clear out any interactors
            vde.iVis.activeMark = null;
            vde.iVis.show('selected');
          }
        }, 1);

        if(app.activePipeline)
          $rootScope.togglePipeline(vde.Vis.pipelines[app.activePipeline]);
      };

      digesting ? f() : $rootScope.$apply(f);
    },

    undo: function() {
      this.currentIdx = (--this.currentIdx < 0) ? 0 : this.currentIdx;
      this.load(this.currentIdx)
    },

    redo: function() {
      this.currentIdx = (++this.currentIdx >= this.timeline.length) ?
          this.timeline.length - 1 : this.currentIdx;
      this.load(this.currentIdx);
    }

  };
}]);

vde.App.controller('TimelineCtrl', function($scope, $rootScope, $window, timeline) {
  var t = function() {
    return {
      length: timeline.timeline.length,
      idx: timeline.currentIdx,
      fileName: timeline.fileName
    };
  }

  $scope.$watch(function($scope) {
    return t()
  }, function() {
    $scope.timeline = t();
  }, true);

  $scope.files = Object.keys(timeline.files());
  $scope.tMdl = {fileName: null};

  $scope.showOpen = function(evt) {
    $('#file-open-popover').css({ left: (evt.pageX - 85) })
      .toggle();
  };

  $scope.open = function(name) {
    timeline.open(name);
    timeline.load(timeline.currentIdx);
    $('#file-open-popover').hide();
  };

  $scope.save = function(evt) {
    if(!$scope.timeline.fileName) $('#file-save-popover').css({ left: (evt.pageX - 85) }).show();
    else {
      timeline.fileName = $scope.timeline.fileName;
      timeline.store();
      $scope.files = Object.keys(timeline.files());
      $('#file-save-popover').hide();
    }
  };

  $scope.close = function() {
    $('#file-open-popover').hide();
    $('#file-save-popover').hide();
  };

  $scope.delete = function(name) {
    timeline.delete(name);
    $scope.files = Object.keys(timeline.files());
  };

  $scope.undo = function() { timeline.undo() };
  $scope.redo = function() { timeline.redo() };

  $window.addEventListener('keydown', function(keyEvent) {
    var keyCode = keyEvent.keyCode;
    var d = keyEvent.srcElement || keyEvent.target;

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
  })
});

vde.App.controller('ExportCtrl', function($scope, $rootScope, timeline, $window) {
  $scope.fileName = timeline.fileName || 'lyra';

  $rootScope.export = function(evt) {
    var makeFile = function(data, type) {
      var blob = new Blob([data], {type: type});
      var url = $window.webkitURL || $window.URL;
      return url.createObjectURL(blob);
    };

    $scope.inlinedValues = makeFile(JSON.stringify(vde.Vis.parse(), null, 2), 'text/json');
    $scope.refData = makeFile(JSON.stringify(vde.Vis.parse(false), null, 2), 'text/json');

    $('#export-popover').css({ left: (evt.pageX - 130) }).toggle();
  };

  $scope.close = function() {
    $('#export-popover').hide();
  }
});