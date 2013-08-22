vde.App.factory('draggable', function($rootScope) {
  return {
    dragstart: function(e, dd, proxy) {
      var isMark = proxy.hasClass('mark'),
          v = $rootScope.activeVisual;

      if(!isMark) {
        $(dd.available).each(function(i, a) {
          // Only light up properties without nodrop
          if(!$(a).hasClass('property')) return;
          if($(a).parent().attr('nodrop')) return;

          $(a).addClass('available');
        });
      }

      if(v instanceof vde.Vis.Mark) {
        if(isMark) v.connectionTargets();
        else v.propertyTargets();
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
      vde.iVis.show('handle');
      $(dd.available).removeClass('available');
      $( dd.proxy ).remove();
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
