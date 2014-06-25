vde.App.directive('vdeExpr', function($rootScope, $compile, $timeout, timeline, Vis, iVis) {
  return {
    restrict: 'A',
    scope: {
      item: '=',
      property: '=',
      ngModel: '=',
      vdeExpr: '@'
    },
    template: '<vde-can-drop-field style="right"></vde-can-drop-field><div class="expr" contenteditable="true"></div>',
    link: function(scope, element, attrs) {
      var parse = function() {
        var elem = $(element).find('.expr');
        var html  = elem.html().replace('<br>','');
        var value = $('<div>' + html + '</div>');
        var strConcat = (attrs.vdeExpr == 'str');
        var digesting = (scope.$$phase || scope.$root.$$phase);

        // When we add a transform containing an expr to the pipeline, the references
        // change and this function is called before .expr.html() is rendered correctly.
        if(digesting && html === "") return;

        value.find('.schema').each(function(i, e) {
          if(strConcat) $(e).text('" + d.' + $(e).attr('field-spec') + ' + "');
          else          $(e).text('d.' + $(e).attr('field-spec'));
        });

        var applyProperties = function() {
          scope.item.properties[scope.property] = strConcat ? '"' + value.text() + '"' : value.text();
          scope.item.properties[scope.property + 'Html'] = html;

          Vis.parse();
        };

        // Safe apply in case parse is called from within a watch.
        if(digesting) {
          applyProperties();
        } else {
          scope.$apply(applyProperties);
        }
      };

      $(element).find('.expr')
        // .html(scope.$parent.ngModel)
        .drop(function(e, dd) {
          var proxy = iVis.dragging;
          var field = $(proxy).data('field') || $(proxy).find('.schema').data('field') || $(proxy).find('.schema').attr('field');
          if(!field) return;

          if(scope.item instanceof Vis.Transform &&
            !scope.item.requiresFork && field instanceof Vis.Field)
              scope.item.requiresFork = ($rootScope.activePipeline.name != field.pipelineName);

          var bindingScope = $rootScope.$new();
          bindingScope.field = new Vis.Field(field);
          scope.item.exprFields.push(bindingScope.field);
          var binding = $compile('<vde-binding style="display: none" field="field"></vde-binding>')(bindingScope);
          scope.$apply();

          if(scope.item.properties.textFormulaHtml == "Text"){
            //If the text is currently just the default value, clear text
            $(this).text("");
          }

          $(this).append(binding.find('.schema').attr('contenteditable', 'false'));

          if(dd) dd.proxy = null;
          $('.proxy').remove();
//          parse();
          $(this).focus();
        }).drop('dropstart', function() {
          $(this).parent().css('borderColor', '#333');
        }).drop('dropend', function() {
          $(this).parent().css('borderColor', '#aaa');
        })
        .bind('keyup', function() { parse(); })
        .bind('click', function() { $(this).focus(); });

      $(element).bind('click', function() { $(this).find('.expr').focus(); });

      // This captures any aggregation changes made to the fields used. We need to set it on
      // a timeout because parse requires the html of element to have been completely rendered.
      scope.$watch('item.exprFields', function() { $timeout(function() { parse(); }, 100); }, true);

      // NgModel is registered on the top-level directive. We need this to move the value of
      // the model into our editable div.
      scope.$watch(function($scope) { return $scope.ngModel; },
        function() {
          var expr = $(element).find('.expr'), html = scope.ngModel;
          if(expr.html() != html) expr.html(html);
        }, true);
    }
  };
});