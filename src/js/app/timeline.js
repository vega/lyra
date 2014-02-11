vde.App.factory('timeline', ["$rootScope", "$timeout", function($rootScope, $timeout) {
  return {
    timeline: [],
    currentIdx: -1,

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
      idx: timeline.currentIdx
    };
  }

  $scope.$watch(function($scope) {
    return t()
  }, function() {
    $scope.timeline = t();
  }, true);

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