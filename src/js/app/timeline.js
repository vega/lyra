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
      $rootScope.$apply(function() {
        $rootScope.groupOrder = vde.Vis.groupOrder = [];
        vde.Vis.import(vis);

        var g = vde.Vis.groups[app.activeGroup];
        if(app.activeVisual) {
          $rootScope.toggleVisual((app.isMark) ?
              g.marks[app.activeVisual] : g.axes[app.activeVisual]);
        }

        if(app.activePipeline)
          $rootScope.togglePipeline(vde.Vis.pipelines[app.activePipeline]);
      });
    },

    undo: function() { this.load(--this.currentIdx) },
    redo: function() { this.load(++this.currentIdx); }

  };
}]);