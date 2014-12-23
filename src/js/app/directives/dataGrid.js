vde.App.directive('vdeDataGrid', function () {
  return {
    restrict: 'A',
    scope: {
      pipeline: '=',
      sliceBeg: '&',
      sliceEnd: '&'
    },
    templateUrl: 'tmpl/inspectors/datasheet.html',
    controller: function($scope) {
      var columns = [], fullData = [];

      function getSchema() { 
        var schema = $scope.pipeline.schema($scope.sliceBeg(), $scope.sliceEnd());
        columns  = schema[0];
        fullData = schema[1];

        // Hierarchical data (which is always nested under fullData.values)
        var values = fullData.values || fullData[0].values;
        if(values && !vg.isFunction(values)) {
          values = fullData.values || fullData;
          $scope.facets = values.map(function(v) { return v.key; });
          $scope.facet = $scope.facets[0];
          $scope.fullSize = values.reduce(function(acc, v) { 
            return acc+v.values.length; }, 0);
        } else {
          $scope.facets = [];
          $scope.facet = null;
          $scope.fullSize = fullData.length;
        }

        $scope.limit = 20;
        $scope.page  = 0;
      }

      function transposeData() {
        var data = fullData, transpose = [];
        var i;
        if($scope.facet) {
          var values = fullData.values || fullData;
          for(i = 0; i < values.length; i++) {
            if(values[i].key == $scope.facet) {
              data = values[i].values;
              break;
            }
          }
        }

        $scope.statsTransforms = {};
        $scope.pipeline.transforms.filter($scope.isStatsTransform).forEach(function(transform) {
          var name = transform.properties.field.name;
          var stats = {};
          $scope.statsTransforms[name] = stats;
          Object.keys(data[0].stats).forEach(function(statName) {
            var key = statName.split('_')[0];
            stats[key] = {
              value: data[0].stats[statName],
              field: new vde.Vis.Field(name, 'data.', '', $scope.pipeline.name, key)
            };
          });
        });

        $scope.size = data.length;
        data = data.slice($scope.page*$scope.limit, $scope.page*$scope.limit + $scope.limit);

        for(i = 0; i < columns.length; i++) {
          var row = [columns[i]], 
              spec = columns[i].spec(),
              f = vg.field(spec);

          for(var j = 0; j < data.length; j++) {
            if(spec == "key") row.push($scope.facet);
            else row.push(eval("data[j]["+f.map(vg.str).join("][")+"]"));
          }

          transpose.push(row);
        }

        $scope.transposedData = transpose;
        $scope.data = data;
      }

      $scope.prevPage = function()  { --$scope.page; };
      $scope.nextPage = function()  { ++$scope.page; };
      $scope.setFacet = function(f) { $scope.facet = f; };

      $scope.$watch(function($scope) {
        return {
          name: $scope.pipeline.name,
          source: $scope.pipeline.source,
          transforms: $scope.pipeline.transforms.map(function(t) { return t.properties; })
        };
      }, function() { getSchema(); transposeData(); }, true);

      $scope.$watch(function($scope) {
        return {page: $scope.page, facet: $scope.facet};
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

      $scope.isStatsTransform = function(transform) {
        return transform.type === 'stats';
      };
    }
  };
});