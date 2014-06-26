vde.App.directive('vdeDataGrid', function ($rootScope, draggable, vg, $timeout) {
  return {
    restrict: 'A',
    scope: {
      pipeline: '=',
      sliceBeg: '&',
      sliceEnd: '&'
    },
    templateUrl: 'tmpl/inspectors/datasheet.html',
    controller: function($scope, $element) {
      var columns = [], fullData = [];

      function getSchema() { 
        var schema = $scope.pipeline.schema($scope.sliceBeg(), $scope.sliceEnd());
        columns  = schema[0];
        fullData = schema[1];

        // Hierarchical data (which is always nested under fullData.values)
        if(fullData.values || fullData[0].values) {
          var values = fullData.values || fullData;
          $scope.facets = values.map(function(v) { return v.key });
          $scope.facet = $scope.facets[0];
          $scope.fullSize = values.reduce(function(acc, v) { 
            return acc+v.values.length }, 0);
        } else {
          $scope.facets = [];
          $scope.facet = null;
          $scope.fullSize = fullData.length;
        }

        $scope.limit = 20;
        $scope.page  = 0;
      };

      function transposeData() {
        var data = fullData, transpose = [];
        if($scope.facet) {
          var values = fullData.values || fullData;
          for(var i = 0; i < values.length; i++) {
            if(values[i].key == $scope.facet) {
              data = values[i].values;
              break;
            }
          }
        }

        $scope.size = data.length;
        data = data.slice($scope.page*$scope.limit, $scope.page*$scope.limit + $scope.limit);

        for(var i = 0; i < columns.length; i++) {
          var row = [columns[i]];

          for(var j = 0; j < data.length; j++)
            row.push(columns[i].spec() == "key" ? $scope.facet : 
              eval("data[j]." + columns[i].spec()))

          transpose.push(row);
        }

        $scope.transposedData = transpose;
      };

      $scope.prevPage = function()  { --$scope.page; }
      $scope.nextPage = function()  { ++$scope.page; }
      $scope.setFacet = function(f) { $scope.facet = f; } 

      $scope.$watch(function($scope) {
        return {
          name: $scope.pipeline.name,
          source: $scope.pipeline.source,
          transforms: $scope.pipeline.transforms.map(function(t) { return t.properties; })
        };
      }, function() { getSchema(); transposeData(); }, true);

      $scope.$watch(function($scope) {
        return {page: $scope.page, facet: $scope.facet}
      }, transposeData, true);

      var carouselInterval;
      $scope.carousel = function(evt) {
        var target = $(evt.currentTarget);

        window.clearInterval(carouselInterval);
        carouselInterval = window.setInterval(function() {
          var threshold = target.width()/ 5, leftOffset = target.offset().left,
              left = leftOffset + threshold,
              right = leftOffset + target.width() - threshold,
              scroll = evt.pageX < left ? -1 : evt.pageX > right ? 1 : 0;

          target.scrollLeft(target.scrollLeft() + scroll);
        }, 5);
      };

      $scope.clearCarousel = function() {
        window.clearInterval(carouselInterval);
      };
    }
  };
});