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
      $scope.transforms = $scope.item.transforms;

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
      };

      $scope.cancelTransform = function(i) {
        $scope.newTransforms.splice(i, 1);
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

          $(element).find('.slick-header-column').each(function(i) {
            $(this).drag('start', function(e, dd) {
              return $('<div></div>')
                .text($(this).text())
                .addClass('schema')
                .css('opacity', 0.75)
                .css('position', 'absolute')
                .css('z-index', 100)
                .appendTo(document.body);
            })
            .drag(function( ev, dd ){
              $( dd.proxy ).css({
                top: dd.offsetY,
                left: dd.offsetX
              });
            })
            .drag("end",function( ev, dd ){
              $( dd.proxy ).remove();
            });
          })
        }
      })
    }
  };
});

vde.App.directive('vdeAddTransform', function() {
  return {
    restrict: 'E',
    template: '<span class="add-transform" ng-if="isNewTransform"><a ng-click="cancelTransform($index)" class="cancel">Cancel</a> <a ng-click="addTransform($index)" class="accept">Add</a></span>'
  }
});