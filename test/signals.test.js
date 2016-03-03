// describe('Lyra Signals', function() {
//     var sg = require(src+'model/signals'),
//         signals = sg();

//   beforeEach(function() { model.view = null; });

//   it('should initialize', function() {
//     var ref = sg.init('foobar', 'helloworld');
//     expect(signals['lyra_foobar']).to.have.property('name', 'lyra_foobar');
//     expect(signals['lyra_foobar']).to.have.property('init', 'helloworld');
//     expect(ref).to.deep.equal({signal: 'lyra_foobar'});
//   });

//   it('should get/set values', function(done) {
//     // First w/o a view
//     sg.init('foobar', 'helloworld');
//     expect(sg.value('foobar')).to.equal('helloworld');
//     expect(sg.value('foobar', 1)).to.equal(sg);
//     expect(sg.value('foobar')).to.equal(1);

//     model.parse(null).then(function() {
//       // Lyra signal interface should set view.
//       expect(sg.value('foobar')).to.equal(1);
//       expect(sg.value('foobar', 5)).to.equal(sg);
//       expect(model.view.signal('lyra_foobar')).to.equal(5);

//       done();
//     });
//   });

//   it('should stash values from the view', function(done) {
//     sg.init('foobar', 'helloworld');
//     model.parse(null).then(function() {
//       expect(sg.value('foobar')).to.equal('helloworld');
//       expect(model.view.signal('lyra_foobar')).to.equal('helloworld');
//       model.view.signal('lyra_foobar', 1);
//       return model.parse(null);
//     }).then(function() {
//       expect(sg.value('foobar')).to.equal(1);
//       expect(model.view.signal('lyra_foobar')).to.equal(1);
//       done();
//     }).catch(function(err) {
//       done(err);
//     });
//   })

//   it('should register defaults', function() {
//     expect(sg).to.contain.keys(['SELECTED', 'MANIPULATORS', 'DELTA', 'ANCHOR']);
//     expect(signals).to.contain.keys([
//       sg.SELECTED, sg.MANIPULATORS, sg.DELTA, sg.ANCHOR
//     ]);
//   });
// });
