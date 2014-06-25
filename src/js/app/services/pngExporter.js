vde.App.factory('PngExporter', function() {
  return {
    get: function() {
      return $('#vis canvas')[0].toDataURL("image/png");
    }
  };
});