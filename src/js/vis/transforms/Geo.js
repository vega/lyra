vde.Vis.transforms.Geo = (function() {
  var geo = function(pipelineName) {
    vde.Vis.Transform.call(this, pipelineName, 'geo', 'Geographic Projection');

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

    this.input = vg.keys(this.properties);
    this.output = {
      x: new vde.Vis.Field('x', '', 'encoded', pipelineName),
      y: new vde.Vis.Field('y', '', 'encoded', pipelineName),
      path: new vde.Vis.Field('path', '', 'encoded', pipelineName),
    };

    return this;
  }

  geo.prototype = new vde.Vis.Transform();
  var prototype = geo.prototype;

  prototype.onFork = function() { return false; }

  prototype.spec = function() {
    var spec = vde.Vis.Transform.prototype.spec.call(this),
        props = this.properties;
    spec.type = (this.geoType == 'GeoJSON') ? 'geopath' : 'geo';

    if(this.properties.projection == 'albersUsa') delete spec.center;

    return (props.value || (props.lat && props.lon)) ? spec : null;
  };

  return geo;
})();
