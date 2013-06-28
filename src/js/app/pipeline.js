vde.App.controller('PipelineCtrl', function($scope, $rootScope, $routeParams) {
  switch($scope.$parent.itemType) {
    case 'visualization':
      $scope.data = vde.Vis._data;
      
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
      $scope.dataSources = vg.keys(vde.Vis._data);
      $scope.$parent.dataBound = 'data' in $scope.$parent.item.from;

      $scope.$parent.addData = function() {
        $scope.$parent.item.from = {data: ''};
        $scope.$parent.dataBound = true;
      };  
    break;
  };
});

vde.App.directive('vdeDataGrid', function () {
  return {
    restrict: 'A',
    scope: {
      vdeDataGrid: '@'
    },
    link: function(scope, element, attrs) {
      attrs.$observe('vdeDataGrid', function(dataSrc) {
        var grid, columns = [],
            data = vde.Vis._data[dataSrc];

        if(data && vg.isArray(data.values)) {
          vg.keys(data.values[0]).forEach(function(d) {
            columns.push({
              name: d, 
              field: d,
              id: d
            });
          });

          grid = new Slick.Grid(element, data.values, columns, {
            enableColumnReorder: false,
            enableCellNavigation: true,
            syncColumnCellResize: true
          });
        }
      })
    }
  };
})