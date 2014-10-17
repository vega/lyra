vde.App.directive('vdeTooltip', function() {
  return function(scope, element, attrs) {
    element.tooltip({
      title: attrs.vdeTooltip,
      placement: attrs.position ? attrs.position : 'bottom',
      // delay: { show: 300, hide: 150 },
      container: 'body'
    });
  };
});