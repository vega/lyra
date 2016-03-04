var Guide = require('../src/js/model/primitives/Guide.js');
var Scale = require('../src/js/model/primitives/Scale.js');
var guide, scale;

beforeEach(function() {
  var def = {
      name: "x",
      padding: 1,
      points: true,
      range: "width",
      round: true,
      type: "ordinal"
    };
  scale = new Scale(def.name, def.type, undefined, def.range);
  axisGuide = new Guide(1, "x", scale._id);
  legendGuide = new Guide(2, "x", scale._id);
});

describe('Axis Guide', function(){
  it('Guide type axis initializes with type', function() {
    expect(axisGuide.type).to.equal('x');
  });

  it('Guide type axis initializes with orient', function() {
    expect(axisGuide.orient).to.equal('bottom');
  });

  it('Guide type axis initializes with scale', function() {
    expect(axisGuide.scale).to.equal(scale._id);
  });

  it('Guide type axis initializes with correct properties', function() {
    expect(axisGuide.properties).to.have.all.keys(
      'ticks',
      'majorTicks',
      'minorTicks',
      'title',
      'labels',
      'axis'
    );
  });

});

describe('Legend Guide', function(){
  it('Guide type legend initializes with _type', function() {
    expect(legendGuide._type).to.equal('x');
  });

  it('Guide type legend initializes with x property', function() {
    expect(legendGuide["x"]).to.equal(scale._id);
  });

  it('Guide type legend initializes with correct properties', function() {
    expect(legendGuide.properties).to.have.all.keys(
      'title',
      'labels',
      'symbols',
      'gradient',
      'legend'
    );
  });
});
