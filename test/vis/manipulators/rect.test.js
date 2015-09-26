describe('Rect Manipulators', function() {
  // Make Voronoi visible.
  var manips = require('../../'+lyraPath+'vis/primitives/marks/manipulators');
  manips.ARROWS.marks[1].properties.update.stroke.value = 'brown';

  beforeEach('New Vis and position Rect', function() {
    lyra.Vis = new Vis().init();
    var rect = lyra.Vis.child('marks', 'rect'),
        name = rect.name;

    lyra.signals.value(name+'_x', 100)
      .value(name+'_x2', 150)
      .value(name+'_y', 100)
      .value(name+'_y2', 150);
  });

  afterEach('Reset default signals', function() {
    lyra.signals.value('lyra_selected', {mark: {}})
      .value('lyra_manipulators', 'handles');
  });

  function select(kind) {
    lyra.view.signal('lyra_selected', lyra.view
        .model().scene().items[0].items[0].items[0].items[0].items[0])
      .signal('lyra_manipulators', kind)
      .update();
  }

  ['handles', 'connectors', 'arrows', 'spans'].forEach(function(kind) {
    it('should support ' + kind, function(done) {
      lyra.parse(null).then(function() {
        select(kind);
        var img  = image(kind + '-rect'),
            test = load(kind + '-rect');

        expect(img).to.deep.equal(test);
        done();
      }).catch(function(err) { 
        done(err); 
      });
    });
  });
});