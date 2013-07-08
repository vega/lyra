vde.App.controller('PipelineCtrl', function($scope, $rootScope, $routeParams) {
  $scope.dataSources = vg.keys(vde.Vis._data);

  switch($scope.$parent.itemType) {
    case 'visualization':    
      $rootScope.showAddData = false;
      $scope.$parent.toggleData = function() {
          $rootScope.showAddData = !$rootScope.showAddData;
          $scope.dataName = '';
          $scope.dataSrc  = '';
          $scope.dataType = '';
      }

      $scope.$parent.types = ['json', 'tsv', 'csv'];
      $scope.addData = function() {
        vde.Vis.data($scope.dataName, $scope.dataSrc, $scope.dataType);

        $rootScope.showAddData = false;
      }
    break;

    case 'mark':
      $scope.$parent.dataBound = 'data' in $scope.$parent.item.from;

      $scope.$parent.addData = function() {
        $scope.$parent.item.from = {data: ''};
        $scope.$parent.dataBound = true;
      };  

      $scope.newTransforms = [];
      $scope.newTransform = function(type) {
        $scope.newTransforms.push(new vde.Vis.transforms[type]);
      };

      $scope.addTransform = function(i) {
        $scope.item.transforms.push($scope.newTransforms[i]);
        $scope.newTransforms.splice(i, 1);

        vde.Vis.parse();
      };

      $scope.removeTransform = function(i, isNewTransform) {
        var cnf = confirm("Are you sure you wish to delete this transformation?")
        if(!cnf) return;

        if(isNewTransform)
          $scope.newTransforms.splice(i, 1);
        else 
          $scope.item.transforms.splice(i, 1);
      };

    break;

    case 'scale':
      // TODO: Scales currently get defined on the original data sources;
      // but if we add a whole bunch of transforms to the original source,
      // maybe that should instantiate a new data source drawn from the original,
      // and define the scale over that?
      var data = $scope.$parent.item.properties.data;
      $scope.schema = vg.keys(vde.Vis._data[data].values[0]);
    break;
  };
});

vde.App.directive('vdeDataGrid', function () {
  return {
    restrict: 'A',
    scope: {
      source: '=',
      transforms: '='
    },
    controller: function($scope, $element, $attrs) {
      $scope.buildSlickGrid = function() {
        var grid, data = vde.Vis._data[$scope.source];
        if(!data || !vg.isArray(data.values)) return;

        var values = vg.duplicate(data.values);
        if(vg.isArray($scope.transforms)) {
          var ingested = values.map(vg.data.ingest);
          $scope.transforms.forEach(function(t) { 
            ingested = t.transform(ingested); 
          });

          values = ingested.map(function(d) { return d.data; });
        }

        // Get column names after transformations to account for
        // any schema changes. 
        var columns = vg.keys(values[0]).map(function(d) {
          return { name: d, field: d, id: d };
        });

        grid = new Slick.Grid($element, values, columns, {
          enableColumnReorder: false,
          enableCellNavigation: true,
          syncColumnCellResize: true
        });

        $($element).find('.slick-header-column').each(function(i) {
          $(this).drag('start', function(e, dd) {
            return $('<div></div>')
              .text($(this).text())
              .addClass('schema')
              .addClass('proxy')
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

      $scope.$watch('source', $scope.buildSlickGrid);     
      $scope.$watch('transforms', $scope.buildSlickGrid, true);      
    }
  };
});

vde.App.directive('vdePipelineCtrls', function() {
  return {
    restrict: 'E',
    templateUrl: 'tmpl/inspectors/pipeline-ctrls.html'
  }
});