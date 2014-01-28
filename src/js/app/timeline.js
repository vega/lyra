vde.App.factory('timeline', ["$rootScope", function($rootScope) {
  return {
    timeline: [],
    currentIdx: -1,

    save: function() {
      this.timeline[++this.currentIdx] = {
        vis: vde.Vis.export(),
        app: {
          activeVisual: ($rootScope.activeVisual || {}).name,
          isMark: $rootScope.activeVisual instanceof vde.Vis.Mark,
          activeGroup: $rootScope.activeGroup.name,
          activePipeline: $rootScope.activePipeline.name
        }
      };
    },

    load: function(idx) {
      var t = this.timeline[idx], vis = t.vis, app = t.app;
      var digesting = ($rootScope.$$phase || $rootScope.$root.$$phase);

      var f = function() {
        $rootScope.groupOrder = vde.Vis.groupOrder = [];
        vde.Vis.import(vis);

        var g = vde.Vis.groups[app.activeGroup];
        if(app.activeVisual) {
          $rootScope.toggleVisual((app.isMark) ?
              g.marks[app.activeVisual] : g.axes[app.activeVisual]);
        }

        if(app.activePipeline)
          $rootScope.togglePipeline(vde.Vis.pipelines[app.activePipeline]);
      };

      digesting ? f() : $rootScope.$apply(digesting);
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