vde.App.controller('PipelinesListCtrl', function($scope, $rootScope, timeline, vg, Vis) {
  $scope.pMdl = { // General catch-all model for scoping
    pipelines: Vis.pipelines,
    showTransforms: false,
    newTransforms: []
  };

  $scope.$watch(function($scope) {
      return vg.keys(Vis._data)
    }, function() {
    $rootScope.dataSources = vg.keys(Vis._data);
    $rootScope.fromSources = [];
    vg.keys(Vis._data).forEach(function(d) { $scope.fromSources.push({key: d, value: d})} );
    $rootScope.fromSources.push({key: 'New Data Source', value: 'vdeNewData'})
  }, true);

  $rootScope.addPipeline = function() {
    var p = new Vis.Pipeline();
    $rootScope.togglePipeline(p);

    timeline.save();
  };

  $rootScope.togglePipeline = function(p, show) {
    if($rootScope.activePipeline == p && !show) {
      $rootScope.activePipeline = null;
      $scope.pMdl.activePipelineSource = null;
    } else {
      $rootScope.activePipeline = p;
      $scope.pMdl.activePipelineSource = p.source;
    }
  };

  $scope.removePipeline = function(p) {
    delete Vis.pipelines[p];
    $('.tooltip').remove();

    timeline.save();
  };

  $scope.setSource = function() {
    var src = $scope.pMdl.activePipelineSource;
    if(src == '') $rootScope.activePipeline.source = null;
    else if(src == 'vdeNewData') $rootScope.newData = true;
    else $rootScope.activePipeline.source = src;

    timeline.save();
  };

  $scope.newTransform = function(type) {
    $scope.pMdl.newTransforms.push(new Vis.transforms[type]);
    $scope.pMdl.showTransforms = false;
  };

  $scope.addTransform = function(i) {
    $scope.pMdl.newTransforms[i].pipelineName = $rootScope.activePipeline.name;
    $rootScope.activePipeline.addTransform($scope.pMdl.newTransforms[i]);

    $scope.pMdl.newTransforms.splice(i, 1);
    Vis.parse().then(function() { timeline.save(); });
  };

  $scope.removeTransform = function(i, isNewTransform) {
    if(isNewTransform) {
      $scope.pMdl.newTransforms[i].destroy();
      $scope.pMdl.newTransforms.splice(i, 1);
    } else {
      var cnf = confirm("Are you sure you wish to delete this transformation?")
      if(!cnf) return;

      $rootScope.activePipeline.transforms[i].destroy();
      $rootScope.activePipeline.transforms.splice(i, 1);
      Vis.parse().then(function() { timeline.save(); });
    }

    $('.tooltip').remove();
  };

  $scope.addScale = function() {
    var s = new Vis.Scale('', $rootScope.activePipeline, {type: 'ordinal'}, 'new_scale');
    s.manual = true;
    timeline.save();

    return s;
  };
});

vde.App.directive('vdeDataGrid', function ($rootScope, draggable, vg) {
  return {
    restrict: 'A',
    scope: {
      pipeline: '=',
      sliceBeg: '&',
      sliceEnd: '&'
    },
    templateUrl: 'tmpl/inspectors/datasheet.html',
    controller: function($scope, $element, $attrs) {
      $scope.buildDataTable = function() {
        if(!$scope.pipeline || !$scope.pipeline.source) return;

        var schema  = $scope.pipeline.schema($scope.sliceBeg(), $scope.sliceEnd());
        var columns = schema[0].reduce(function(c, f) {
          return c.concat([{ sTitle: f.name, mData: f.spec(), headerCssClass: f.raw() ? 'raw' : 'derived' }]);
        }, [{ sTitle: 'col', mData: null}]);

        var values = schema[1];
        var facets = ($scope.facets = []), facetedColumns = [];
        $scope.currentFacets = {};

        function flatten(data, list, parent, depth) {
          if (data.values) {
            facets[depth] || (facets[depth] = {keys:[]});
            if(data.key) {
              facets[depth].keys.push(data.key);

              columns.some(function(c, i) {
                if(c.sTitle == 'key_' + depth) {
                  facets[depth].colIdx = i;
                  return true;
                }
              });
            }
            parent['key'] = data.key;
            parent['key_' + depth++] = data.key;

            for (var i=0, n=data.values.length; i<n; ++i) {
              flatten(data.values[i], list, parent, depth);
            }
          } else {
            var val = vg.duplicate(parent);
            for(var k in data) val[k] = data[k]
            list.push(val);
          }
          return list;
        }

        var flattened = values;
        if(values.values) flattened = flatten(values, [], {}, 0);
        else if(values[0].values) flattened = flatten({ values: values, key: "", keys: []}, [], {}, 0);

        var dataTableId = $scope.dataTableId = 'datatable_' + Date.now();

        // WARNING: leaking oTable. How do
        $('.table', $element).html('<table id="' + dataTableId + '"></table>');
        var oTable = $('#' + dataTableId, $element).dataTable({
          'aaData': flattened,
          'aoColumns': columns,
          'sScrollX': '250px',
          // 'sScrollInner': '150%',
          'sScrollY': '250px',
          // 'bScrollCollapse': true,
          'sDom': 'rtip',
          'iDisplayLength': 20,
          // 'bAutoWidth': false,
          // 'bJQueryUI': true,
          'bDeferRender': true,
          'bSort': false,
          'bDestroy': true,
          'oLanguage': {
            'sInfo': '_START_&ndash;_END_ of _TOTAL_',
            'oPaginate': {'sPrevious': '', 'sNext': ''},
            'sInfoFiltered': '(from _MAX_)'
          },
          fnDrawCallback: function(oSettings) {
            var self = this,
                thead = oSettings.nTHead,
                tbody = oSettings.nTBody,
                start = oSettings._iDisplayStart,
                end   = oSettings._iDisplayEnd,
                data  = oSettings.aoData;

            if(facetedColumns.length == 0) {
              facets.forEach(function(f) {
                if(f.colIdx) {
                  facetedColumns.push(f.colIdx);
                  $scope.showFacet(f.colIdx, f.keys[0]);
                }
              });
            }

            // Transpose data
            for(var i = 0; i < columns.length - 1; i++) {
              var colData = [], nTr = $('<tr></tr>');
              if(facetedColumns.indexOf(i+1) != -1) continue;

              for(var j = start; j < end; j++) {
                // Use aiDisplay to make sure we get the correct column idices (e.g. on filter)
                var d = data[oSettings.aiDisplay[j]];
                if(d) nTr.append('<td>' + $('td:eq(' + i + ')', d.nTr).text() + '</td>');
              }

              $(tbody).append(nTr);
            }
            $(thead).hide();
            $('.even, .odd', tbody).remove();
          }
        });

        new FixedColumns(oTable, {
          fnDrawCallback: function(left, right) {
            var self = this,
                oSettings = oTable.fnSettings(),
                table = oSettings.nTable,
                tbody = oSettings.nTBody,
                lbody = left.body;

            // Clear out the fixed column header (columns[0])
            $('thead tr th', left.header).text('');

            // Ensure that there are as many header rows as there are columns
            var rowHeaders = $('tbody tr td', lbody).length;

            if(rowHeaders < columns.length) {
              for(var i = rowHeaders+1; i < columns.length; i++) {
                var td = $('<td></td>')
                  .text(columns[i].sTitle)
                  .css('width', $('tbody tr td:eq(0)', lbody).css('width'));

                $('tbody tr:eq(' + (i-1) + ')', lbody).append(td);
              }
            }
            if(rowHeaders > columns.length)
              $('tbody tr:gt(' + (columns.length-2) + ')', lbody).remove()

            facetedColumns.forEach(function(c) { $('tbody tr:eq(' + (c-1) + ')', lbody).remove() });
            // Now, make them draggable
            $('tbody tr td', lbody).each(function(i) {
              var c = columns[i+1];
              var f = schema[0][i];
              if(!c) return;

              $(this).text(c.sTitle)
                .addClass(c.headerCssClass)
                .drag('start', function(e, dd) {
                  var proxy = $('<div></div>')
                    .text($(this).text())
                    .addClass('schema proxy ' + c.headerCssClass)
                    .data('field', f)
                    .css({ opacity: 0.75, position: 'absolute', 'z-index': 100 })
                    .appendTo(document.body);

                  return draggable.dragstart(e, dd, proxy);
                })
                .drag(draggable.drag)
                .drag('end', draggable.dragend);

                // Reset the height of its parent
                $(this).parent().css('height', $('tr:eq(' + i + ')', tbody).css('height'));
            });

            // Widths/Heights get screwy after the transpose, so reset them.
            var lWrap = $(lbody).parent().parent().width('auto');
            this.s.iLeftWidth  = lWrap.width() > 75 ? 75 : lWrap.width();
            this.s.iRightWidth = 0;
            this._fnGridLayout();

            $('tbody tr td', lbody).each(function() {
              $(this).width(self.s.iLeftWidth - 10)
                .height($(this).parent().height() - 10)
                .css('position', 'absolute');
            });

            var height = $(table).height() + 15;
            $(table).parent().height(height > 250 ? 250 : height);
          }
        });
      };

      $scope.filterFacets = function(f) {
        return f.keys && f.keys.length > 0;
      };

      $scope.showFacet = function(column, value) {
        var oTable = $('#' + $scope.dataTableId).dataTable();
        oTable.fnFilter(value, column);
        $scope.currentFacets[column] = value;
      };

      $scope.$watch(function($scope) {
        return {
          name: $scope.pipeline.name,
          source: $scope.pipeline.source,
          transforms: $scope.pipeline.transforms.map(function(t) { return t.properties; })
        }
      }, $scope.buildDataTable, true);

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