vde.App.controller('PipelineCtrl', function($scope, $rootScope, $routeParams, logger) {
  $scope.pMdl = { // General catch-all model for scoping
    pipelines: vde.Vis.pipelines,
    dataSources: vde.Vis._data
  }; 

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

    logger.log('remove_transform', { idx: i, isNewTransform: isNewTransform }, false, true);
  }; 

  $scope.addScale = function() {
    var s = new vde.Vis.Scale('', $rootScope.activePipeline, {type: 'ordinal'}, 'new_scale');
    
    logger.log('add_scale', { scale: s.name }, false, true);

    return s;
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
      $scope.buildDataTable = function() {
        if(!$scope.pipeline || !$scope.pipeline.source) return;

        var schema  = $scope.pipeline.schema($scope.sliceBeg(), $scope.sliceEnd());
        var columns = schema[0].reduce(function(c, f) { 
          return c.concat([{ sTitle: f.name, mData: f.spec(), headerCssClass: f.raw ? 'raw' : 'derived' }]);
        }, [{ sTitle: 'col', mData: null}]);

        var values = schema[1];

        if(!vg.isArray(values) || vg.isArray(values[0].values)) { // Facet
          values = (values.values || values).reduce(function(vals, v) {
            return vals.concat(v.values.reduce(function(vs, vv) {
              vg.keys(v).forEach(function(k) {
                if(['index', 'values'].indexOf(k) != -1) return;
                vv[k] = v[k];
              }); 

              return vs.concat([vv]);
            }, []));
          }, []);
        }

        var lastType = ($scope.pipeline.transforms[$scope.pipeline.transforms.length-1] || {}).type;

        $($element).html('<table></table>');
        var oTable = $('table', $element).dataTable({
          'aaData': values,
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
            'oPaginate': {'sPrevious': '', 'sNext': ''}
          },
          fnDrawCallback: function(oSettings) {
            var self = this,
                thead = oSettings.nTHead,
                tbody = oSettings.nTBody,
                start = oSettings._iDisplayStart, 
                end   = oSettings._iDisplayEnd,
                data  = oSettings.aoData;

            ///
            // First, transpose the data
            ///
            for(var i = 0; i < columns.length - 1; i++) {
              var colData = [], nTr = $('<tr></tr>');

              for(var j = start; j < end; j++) {
                var d = data[j];
                nTr.append('<td>' + $('td:eq(' + i + ')', d.nTr).text() + '</td>');
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

            // Now, make them draggable
            $('tbody tr td', lbody).each(function(i) {
              var c = columns[i+1];
              var f = schema[0][i];
              if(!c) return;

              $(this).text(c.sTitle)
                .addClass(c.headerCssClass)
                .drag('start', function(e, dd) {
                  $(dd.available).each(function(i, a) {
                    // Only light up properties without nodrop
                    if(!$(a).hasClass('property')) return;
                    if($(a).parent().attr('nodrop')) return;

                    $(a).addClass('available');
                  })
                  return $('<div></div>')
                    .text($(this).text())
                    .addClass('schema proxy ' + c.headerCssClass)
                    .data('field', f)
                    .css({ opacity: 0.75, position: 'absolute', 'z-index': 100 })
                    .appendTo(document.body);
                })
                .drag(function(ev, dd){ 
                  $(dd.proxy).css({ top: ev.pageY, left: ev.pageX }); 
                })
                .drag("end", function(ev, dd){ 
                  $(dd.available).removeClass('available');
                  $(dd.proxy).remove(); 
                }); 

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