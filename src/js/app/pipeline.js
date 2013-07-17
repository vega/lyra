vde.App.controller('PipelineCtrl', function($scope, $rootScope, $routeParams) {
  $scope.pMdl = { // General catch-all model for scoping
    pipelines: vde.Vis.pipelines,
    dataSources: vg.keys(vde.Vis._data)
  }; 

  $scope.togglePipeline = function(p) {
    $rootScope.activePipeline = p;
    $scope.pMdl.activePipelineSource = p.source;
  };

  $scope.removePipeline = function(p) {
    delete vde.Vis.pipelines[p];
  };

  $scope.setSource = function() {
    var src = $scope.pMdl.activePipelineSource;
    if(src == '') $rootScope.activePipeline.source = null;
    else if(src == 'vdeNewData') {
      // TODO: Show Modal Dialog
    }
    else $rootScope.activePipeline.source = src;
  };

  $scope.newTransforms = [];
  $scope.newTransform = function(type) {
    $scope.newTransforms.push(new vde.Vis.transforms[type]);
  };

  $scope.addTransform = function(i) {
    $scope.newTransforms[i].pipeline = $rootScope.activePipeline;
    $rootScope.activePipeline.transforms.push($scope.newTransforms[i]);
    $scope.newTransforms.splice(i, 1);

    vde.Vis.parse();
  };

  $scope.removeTransform = function(i, isNewTransform) {
    var cnf = confirm("Are you sure you wish to delete this transformation?")
    if(!cnf) return;

    if(isNewTransform)
      $scope.newTransforms.splice(i, 1);
    else {
      $rootScope.activePipeline.transforms.splice(i, 1);
      vde.Vis.parse();
    }
  };  
});

vde.App.directive('vdeDataGrid', function () {
  return {
    restrict: 'A',
    scope: {
      pipeline: '=',
      sliceBeg: '&',
      sliceEnd: '&'
    },
    controller: function($scope, $element, $attrs) {
      $scope.buildSlickGrid = function() {
        if(!$scope.pipeline || !$scope.pipeline.source) return;

        var values = $scope.pipeline.values($scope.sliceBeg(), $scope.sliceEnd());

        // Get column names after transformations to account for
        // any schema changes. 
        var columns = [];

        vg.keys(values[0]).forEach(function(d) { 
          if(d == 'data') return;
          columns.push({ name: d, field: d, id: d, headerCssClass: 'derived' }); 
        });

        columns = columns.concat(vg.keys(values[0].data).map(function(d) {
          return { name: d, field: 'data.' + d, id: d, headerCssClass: 'raw'};
        }));

        var grid = new Slick.Grid($element, values, columns, {
          enableColumnReorder: false,
          enableCellNavigation: true,
          syncColumnCellResize: true,
          dataItemColumnValueExtractor: function(item, columnDef) {
            var names = columnDef.field.split('.'),
                val   = item[names[0]];

            for (var i = 1; i < names.length; i++)
              val = (val && typeof val == 'object' && names[i] in val) ? 
                val[names[i]] : '';

            return val;
          }
        });

        $($element).find('.slick-header-column').each(function(i) {
          $(this).drag('start', function(e, dd) {
            return $('<div></div>')
              .text($(this).text())
              .addClass('schema')
              .addClass('proxy')
              .addClass(columns[i].headerCssClass)
              .attr('field', columns[i].field)
              .css('opacity', 0.75)
              .css('position', 'absolute')
              .css('z-index', 100)
              .appendTo(document.body);
          })
          .drag(function(ev, dd){
            $(dd.proxy).css({ top: dd.offsetY, left: dd.offsetX });
          })
          .drag("end", function(ev, dd){ $(dd.proxy).remove(); });
        })
      };

      $scope.$watch(function($scope) { 
        return {
          name: $scope.pipeline.name, 
          source: $scope.pipeline.source,
          transforms: $scope.pipeline.transforms.map(function(t) { return t.properties; })
        } 
      }, $scope.buildSlickGrid, true);     
    }
  };
});

vde.App.directive('vdePipelineCtrls', function() {
  return {
    restrict: 'E',
    templateUrl: 'tmpl/inspectors/pipeline-ctrls.html'
  }
});