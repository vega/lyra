vde.App.directive('vdeInferredPopover', function($timeout) {
  return {
    restrict: 'A',
    link: function(scope, element) {
      var canDropField = element.parent().find('.canDropField');
      var dropOffset = canDropField.offset();
      var threshold = $('#groups-list').offset().left + $('#groups-list').width()/2 - 10;

      // Position the popover above the nearest .canDropField
      element.removeClass('bottom-left bottom-right')
          .addClass(dropOffset.left > threshold ? 'bottom-right' : 'bottom-left')
          .css({ top: (dropOffset.top - 60), left: 10 });

      // Fade out the popover after a few seconds, but if the user mouses
      // in/out, restart the fading timer. If we fade out, then that implies
      // the user is ok with the inference, so clear out the inference flag.
      var fadeOut = function() {
        return $timeout(function() {
          element.fadeOut();
          delete scope.item.properties[scope.property].inferred;
        }, 3000);
      };

      var f = fadeOut();
      element.on('click mouseover', function() { $timeout.cancel(f); })
        .on('mouseleave', function() { f = fadeOut(); });
    }
  };
});