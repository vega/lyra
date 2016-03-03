describe('Manipulators', function() {
  // Make Voronoi visible.
  var manips = require(src+'model/primitives/marks/manipulators');
  manips.CONNECTORS.marks[1].properties.update.stroke.value = 'brown';
  manips.ARROWS.marks[1].properties.update.stroke.value = 'brown';

  function select(kind) {
    model.view.signal('lyra_selected', model.view
        .model().scene().items[0].items[0].items[0].items[0].items[0])
      .signal('lyra_manipulators', kind)
      .update();
  }

  function test(kind) {
    it('should support ' + kind, function(done) {
      model.parse(null).then(function() {
        select(kind);
        var img  = image(kind + '-rect'),
            test = load(kind + '-rect');

        expect(img).to.deep.equal(test);
        done();
      }).catch(function(err) {
        done(err);
      });
    });
  }

  describe('Rect', function() {
    beforeEach('Position Rect', function() {
      var rect = model.Scene.child('marks.rect'),
          prefix = 'lyra_rect_'+rect._id;

      model.signal(prefix+'_x', 100)
        .signal(prefix+'_x2', 150)
        .signal(prefix+'_y', 100)
        .signal(prefix+'_y2', 150);
    });

    ['handles', 'connectors', 'arrows', 'spans'].forEach(test);
  });
});
