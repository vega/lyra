vde.App.factory('draggable', function($rootScope) {
  return {
    dragstart: function(e, dd, proxy) {
      var isMark = proxy.hasClass('mark'),
          v = vde.iVis.activeMark;

      if(isMark) {
        var markType = proxy.attr('id');
        vde.iVis.newMark = eval('new vde.Vis.marks["' + markType + '"]');
      } else {
//        $(dd.available).each(function(i, a) {
//          // Only light up properties without nodrop
//          if(!$(a).hasClass('property')) return;
//          if($(a).parent().attr('nodrop')) return;
//
//          $(a).addClass('available');
//        });
        $('.canDropField').addClass('dragging');
      }

      if(v instanceof vde.Vis.Mark) {
        if(isMark && vde.iVis.newMark.canConnect) v.connectionTargets();
        else if(!isMark)  {
          // Definitely show any property targets for the active visual
          v.propertyTargets();
        }
      }

      if(!isMark) {
        // If the pipeline doesn't already have a facet applied to it
        // show dropzones for grouping
//        if(!$rootScope.activePipeline.forkName)
//          $rootScope.activeLayer.propertyTargets();
      }

      return proxy;
    },

    drag: function(e, dd) {
      vde.iVis.dragging = dd.proxy;
      $(dd.proxy).css({
        top: e.pageY + 5,
        left: e.pageX - $(dd.proxy).width()
      });
    },

    dragend: function(e, dd) {
      vde.iVis.dragging = null;
      vde.iVis.newMark  = null;
      vde.iVis.show('selected');
//      $(dd.available).removeClass('available');
      $(dd.proxy).unbind().empty().remove();
      dd.proxy = null;
      $('.canDropField').removeClass('dragging');
      $('.tooltip').remove();
    }
  }
});

vde.App.directive('vdeDraggable', function($rootScope, draggable) {
  return function(scope, element, attrs) {
    element
      .drag('start', function(e, dd) {
        var proxy = $(this).clone(true, true)
            .addClass('proxy')
            .css('opacity', 0.75)
            .css('position', 'absolute')
            .css('z-index', 100)
            .appendTo(document.body);

        return draggable.dragstart(e, dd, proxy);
      })
      .drag(draggable.drag)
      .drag('end', draggable.dragend);
  }
});
