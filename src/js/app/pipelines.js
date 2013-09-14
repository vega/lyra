vde.App.controller('PipelineCtrl', function($scope, $rootScope, logger) {
  $scope.pMdl = { // General catch-all model for scoping
    pipelines: vde.Vis.pipelines
  };

  function dataSources() { return vg.keys(vde.Vis._data); }

  $scope.$watch(function($scope) {
      return dataSources();
    }, function() { $rootScope.dataSources = dataSources() }, true);

  $scope.addPipeline = function() {
    $rootScope.activePipeline = new vde.Vis.Pipeline();

    logger.log('new_pipeline', {
      activePipeline: $rootScope.activePipeline.name
    }, false, true);
  };

  $rootScope.togglePipeline = function(p) {
    $rootScope.activePipeline = p;
    $scope.pMdl.activePipelineSource = p.source;

    logger.log('toggle_pipeline', {
      activePipeline: $rootScope.activePipeline.name
    });
  };

  $scope.removePipeline = function(p) {
    delete vde.Vis.pipelines[p];
    $('.tooltip').remove();

    logger.log('remove_pipeline', { pipelineName: p }, false, true);
  };

  $scope.setSource = function() {
    var src = $scope.pMdl.activePipelineSource;
    if(src == '') $rootScope.activePipeline.source = null;
    else if(src == 'vdeNewData') $rootScope.newData = true;
    else $rootScope.activePipeline.source = src;

    logger.log('set_source', { src: src }, false, true);
  };

  $scope.newTransforms = [];
  $scope.newTransform = function(type) {
    $scope.newTransforms.push(new vde.Vis.transforms[type]);

    logger.log('new_transform', { type: type });
  };

  $scope.addTransform = function(i) {
    $scope.newTransforms[i].pipelineName = $rootScope.activePipeline.name;
    $rootScope.activePipeline.addTransform($scope.newTransforms[i]);

    logger.log('add_transform', { transform: $scope.newTransforms[i] }, false, true);

    $scope.newTransforms.splice(i, 1);
    vde.Vis.parse();
  };

  $scope.removeTransform = function(i, isNewTransform) {
    var cnf = confirm("Are you sure you wish to delete this transformation?")
    if(!cnf) return;

    if(isNewTransform) {
      $scope.newTransforms[i].destroy();
      $scope.newTransforms.splice(i, 1);
    } else {
      $rootScope.activePipeline.transforms[i].destroy();
      $rootScope.activePipeline.transforms.splice(i, 1);
      vde.Vis.parse();
    }

    $('.tooltip').remove();

    logger.log('remove_transform', { idx: i, isNewTransform: isNewTransform }, false, true);
  };

  $scope.addScale = function() {
    var s = new vde.Vis.Scale('', $rootScope.activePipeline, {type: 'ordinal'}, 'new_scale');
    s.manual = true;

    logger.log('add_scale', { scale: s.name }, false, true);

    return s;
  };
});

vde.App.directive('vdeDataGrid', function ($rootScope, draggable) {
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
                  $scope.filter(f.colIdx, f.keys[0]);
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

      $scope.filter = function(column, value) {
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
    }
  };
});

vde.App.directive('vdePipelineCtrls', function($rootScope, $timeout) {
  return {
    restrict: 'E',
    templateUrl: 'tmpl/inspectors/pipeline-ctrls.html',
    controller: function($scope, $element, $attrs) {
      $scope.previewTransform = function(idx, evt) {
        $rootScope.previewTransformIdx = ($rootScope.previewTransformIdx != null) ? null : idx;

        $timeout(function(){
          $('#preview-transform').css('left', (evt.pageX+30) + 'px').css('top', (evt.pageY-20) + 'px');
        }, 100);
      };


    }
  }
});
