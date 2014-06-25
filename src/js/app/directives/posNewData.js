vde.App.directive('vdePosNewData', function () {
  return function(scope, element) {
    element.on('change', function(evt) {
      var offset = $(evt.target).offset();
      $('#data-popover').css('top', (offset.top+25) + 'px');
    });
  };
});