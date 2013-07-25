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
    $rootScope.activePipeline.addTransform($scope.newTransforms[i]);
    $scope.newTransforms.splice(i, 1);

    vde.Vis.parse();
  };

  $scope.removeTransform = function(i, isNewTransform) {
    var cnf = confirm("Are you sure you wish to delete this transformation?")
    if(!cnf) return;

    if(isNewTransform)
      $scope.newTransforms.splice(i, 1);
    else {
      $rootScope.activePipeline.transforms[i].destroy();
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
      $scope.buildDataTable = function() {
        if(!$scope.pipeline || !$scope.pipeline.source) return;

        var schema  = $scope.pipeline.schema($scope.sliceBeg(), $scope.sliceEnd());
        var columns = schema[0].reduce(function(c, f) { 
          return c.concat([{ sTitle: f.name, mData: f.spec(), headerCssClass: f.raw ? 'raw' : 'derived' }]);
        }, [{ sTitle: 'col', mData: null}]);

        var values = schema[1];

        if(!vg.isArray(values)) { // Facet
          values = values.values.reduce(function(vals, v) {
            return vals.concat(v.values.reduce(function(vs, vv) {
              vv.key = v.key;
              vv.keys = v.keys;
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
          'sScrollY': '200px',
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
                  return $('<div></div>')
                    .text($(this).text())
                    .addClass('schema proxy ' + c.headerCssClass)
                    .data('field', f)
                    .css({ opacity: 0.75, position: 'absolute', 'z-index': 100 })
                    .appendTo(document.body);
                })
                .drag(function(ev, dd){ 
                  $(dd.proxy).css({ top: dd.offsetY, left: dd.offsetX }); 
                })
                .drag("end", function(ev, dd){ 
                  $(dd.proxy).remove(); 
                }); 

                // Reset the height of its parent
                $(this).parent().css('height', $('tr:eq(' + i + ')', tbody).css('height'));
            });

            // Widths get screwy after the transpose, so reset them.
            var lWrap = $(lbody).parent().parent().width('auto');
            this.s.iLeftWidth  = lWrap.width() > 75 ? 75 : lWrap.width();
            this.s.iRightWidth = 0;
            this._fnGridLayout();

            $('tbody tr td', lbody).each(function() {
              $(this).width(self.s.iLeftWidth - 10)
                .height($(this).parent().height() - 10)
                .css('position', 'absolute');
            });         
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

vde.App.directive('vdePipelineCtrls', function() {
  return {
    restrict: 'E',
    templateUrl: 'tmpl/inspectors/pipeline-ctrls.html'
  }
});