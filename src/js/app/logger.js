vde.App.factory('logger', ['$http', function(http) {
  return {
    events: [],
    name: null,

    log: function(eventType, data, showGroup, showPipeline) {
      var e = {event: eventType, data: data};
      if(showGroup) e.groups = vg.duplicate(vde.Vis.groups);
      if(showPipeline) e.pipelines = vg.duplicate(vde.Vis.pipelines);

      this.events.push(e);
      if(this.events.length % 10 == 0) this.save();
    },

    save: function() {
      if(!this.name) this.name = new Date().toJSON();
      http({
        method: 'POST',
        url: 'logger.php',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        data: $.param({events: JSON.stringify(this.events), name: this.name})
      });
    }
    
  };
}]);

vde.App.controller('BugCtrl', function($scope, $rootScope, logger) { 
  $scope.bMdl = { bugReport: false };

  $scope.reportBug = function() {
    logger.log('bug_report', { 
      name: $scope.bMdl.name,
      email: $scope.bMdl.email,
      report: $scope.bMdl.report
    }, true, true);

    logger.save();
    $scope.bMdl.bugReport = false;
    $scope.bMdl.report = '';

    $window.alert('Thanks for the bug report!');
  };

});