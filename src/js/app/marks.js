vde.App.controller('MarksCtrl', function($scope, $rootScope, logger) { 
  // Cardinal sin
  $(document).ready(function() {
    vde.Vis.parse(); 

      if(vg.keys(vde.Vis._rawData).length == 0) {
        vde.Vis.data('medals', 'data/medals.json', 'json');
        // vde.Vis.data('olympics', 'data/olympics.json', 'json');
        vde.Vis.data('groups', 'data/groups.json', 'json');
        vde.Vis.data('barley', 'data/barley.json', 'json');
        vde.Vis.data('iris', 'data/iris.json', 'json');
        vde.Vis.data('jobs', 'data/jobs.json', 'json');
        vde.Vis.data('stocks', 'data/stocks.csv', {"type": "csv", "parse": {"price":"number", "date":"date"}});
      }
  })
});

vde.App.directive('vdeMarkDroppable', function($rootScope, $timeout, logger) {
  return function(scope, element, attrs) {
    element.drop(function(e, dd) {
      var markType = $(dd.drag).attr('id');
      if(!markType) return false;

      scope.$apply(function() {
        // Add mark to model, then reparse vega spec
        var groupName = ($rootScope.activeGroup || {}).name;
        var mark = eval('new vde.Vis.marks["' + markType + '"](undefined, groupName)');
        vde.Vis.parse();

        // Then route to this mark to load its inspector, but wait until 
        // parsing/annotating is done.
        $timeout(function() { $rootScope.toggleVisual(mark); }, 1);

        logger.log('new_mark', {
          markType: markType,
          markName: mark.name,
          activeGroup: ($rootScope.activeGroup || {}).name,
          markGroup: mark.groupName
        }, true);        
      });
    });
  }
})