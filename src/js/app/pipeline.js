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
        var columns = [{ sTitle: 'col', mData: null}];
        schema[0].forEach(function(f) {
          columns.push({ sTitle: f.name, mData: f.spec(), headerCssClass: f.raw ? 'raw' : 'derived' });
        });

        $($element).html('<table></table>');

        oTable = $('table', $element).dataTable({
          'aaData': schema[1],
          'aoColumns': columns,
          'sScrollX': '250px',
          // 'sScrollInner': '150%',
          'sScrollY': '200px',
          'bScrollCollapse': true,
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
          fnDrawCallback: function (oSettings) {
            var thead = oSettings.nTHead,
                tbody = oSettings.nTBody,
                start = oSettings._iDisplayStart, 
                end   = oSettings._iDisplayEnd,
                data  = oSettings.aoData;

            for(var i = 0; i < columns.length - 1; i++) {
              var colData = [], nTr = $('<tr></tr>');

              for(var j = start; j < end; j++) {
                var d = data[j];
                nTr.append('<td>' + $('td:eq(' + i + ')', d.nTr).text() + '</td>');
              }

              $(tbody).append(nTr);
            };

            $(thead).hide();
            $('.even, .odd', tbody).remove();
          }
        });

        new FixedColumns(oTable, {
          fnDrawCallback: function(left, right) {
            var self = this;

            // Replace the first/fixed column with col headers
            $('thead tr th', left.header).text('');
            $('tbody tr td', left.body).each(function(i) {
              var c = columns[i+1];
              var f = schema[0][i];
              if(!c) return;

              $(this).text(c.sTitle)
                .addClass(c.headerCssClass)
                .drag('start', function(e, dd) {
                  return $('<div></div>')
                    .text($(this).text())
                    .addClass('schema')
                    .addClass('proxy')
                    .addClass(c.headerCssClass)
                    .data('field', f)
                    .css('opacity', 0.75)
                    .css('position', 'absolute')
                    .css('z-index', 100)
                    .appendTo(document.body);
                })
                .drag(function(ev, dd){ 
                  $(dd.proxy).css({ top: dd.offsetY, left: dd.offsetX }); 
                })
                .drag("end", function(ev, dd){ 
                  $(dd.proxy).remove(); 
                }); 
            });

            // Reset widths
            var lWrap = $(left.body).parent().parent().width('auto');
            this.s.iLeftWidth  = lWrap.width() > 75 ? 75 : lWrap.width();
            this.s.iRightWidth = 0;
            this._fnGridLayout();

            $('tbody tr td', left.body).each(function() {
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