describe('Lyra Signals', function() {
    var Vis = require('../'+lyraPath+'vis/Visualization'),
        sg = require('../'+lyraPath+'state/signals'),
        signals = sg();

  beforeEach(function() { lyra.view = null; });

  it('should be namespaced', function() {
    for (var k in signals) {
      expect(k).to.match(/^lyra_/);
    }

    expect(sg.ns('foobar')).to.equal('lyra_foobar');
    expect(sg.ns('lyra_foobar')).to.equal('lyra_foobar');
  });

  it('should initialize', function() {
    var ref = sg.init('foobar', 'helloworld');
    expect(signals['lyra_foobar']).to.have.property('name', 'lyra_foobar');
    expect(signals['lyra_foobar']).to.have.property('init', 'helloworld');
    expect(ref).to.deep.equal({signal: 'lyra_foobar'});
  });

  it('should get/set values', function(done) {
    // First w/o a view
    sg.init('foobar', 'helloworld');
    expect(sg.value('foobar')).to.equal('helloworld');
    expect(sg.value('foobar', 1)).to.equal(sg);
    expect(sg.value('foobar')).to.equal(1);

    // Add a view
    lyra.Vis = new Vis().init();
    lyra.parse(null).then(function() {
      // Lyra signal interface should set view.
      expect(sg.value('foobar')).to.equal(1);
      expect(sg.value('foobar', 5)).to.equal(sg);
      expect(lyra.view.signal('lyra_foobar')).to.equal(5);

      done();
    });
  });

  it('should stash values from the view', function(done) {
    sg.init('foobar', 'helloworld');
    lyra.Vis = new Vis().init();
    lyra.parse(null).then(function() {
      expect(sg.value('foobar')).to.equal('helloworld');
      expect(lyra.view.signal('lyra_foobar')).to.equal('helloworld');
      lyra.view.signal('lyra_foobar', 1);
      return lyra.parse(null);
    }).then(function() {
      expect(sg.value('foobar')).to.equal(1);
      expect(lyra.view.signal('lyra_foobar')).to.equal(1);
      done();
    }).catch(function(err) { 
      done(err); 
    });
  })

  it('should register defaults', function() {
    expect(sg).to.contain.keys(['SELECTED', 'MANIPULATORS', 'DELTA', 'ANCHOR']);
    expect(signals).to.contain.keys([
      sg.SELECTED, sg.MANIPULATORS, sg.DELTA, sg.ANCHOR
    ]);
  });


});