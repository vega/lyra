vde.Vis.transforms.Geo = (function() {
  var geo = function(pipelineName) {
    vde.Vis.Transform.call(this, pipelineName, 'geo', ['lat', 'lon', 'projection', 'center', 'translate', 'scale', 'rotate', 'precision', 'clipAngle']);

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

    this.output = {
      x: new vde.Vis.Field('x', false, 'geo', pipelineName),
      y: new vde.Vis.Field('y', false, 'geo', pipelineName),
      path: new vde.Vis.Field('path', false, 'geo', pipelineName),
    };

    return this;
  }

  geo.prototype = new vde.Vis.Transform();
  var prototype = geo.prototype;

  prototype.spec = function() {
    var spec = vde.Vis.Transform.prototype.spec.call(this),
        props = this.properties;
    spec.type = (this.geoType == 'GeoJSON') ? 'geopath' : 'geo';

    return (props.value || (props.lat && props.lon)) ? spec : null;
  };

  return geo;
})();
