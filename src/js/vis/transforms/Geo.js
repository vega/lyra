vde.Vis.transforms.Geo = (function() {
  var geo = function() {
    vde.Vis.Transform.call(this, 'geo', ['lat', 'lon', 'projection', 'center', 'translate', 'scale', 'rotate', 'precision', 'clipAngle']);

    this.isVisual = true;
    this.geoType  = 'Latitude/Longitude';

    this.properties = {
      lat: null,
      lon: null,
      value: null,
      projection: 'mercator',
      center: [0, 0],
      translate: [0, 0],
      scale: 0,
      rotate: 0,
      precision: 0,
      clipAngle: 0
    };

    console.log(this.pipelineName);

    return this;
  }

  geo.prototype = new vde.Vis.Transform();
  var prototype = geo.prototype;

  prototype.spec = function() {
    var spec = vde.Vis.Transform.prototype.spec.call(this);
    spec.type = (this.geoType == 'GeoJSON') ? 'geopath' : 'geo';

    return spec;
  };

  return geo;
})();
