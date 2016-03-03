// describe('Rules', function() {
//   function test(prop, done) {
//     model.parse(null).then(function() {
//       var img  = image('rules-' + prop),
//           test = load('rules-' + prop);
//       expect(img).to.deep.equal(test);
//       done();
//     }).catch(function(error) { done(error); });
//   }

//   it('should bind x', function(done) {
//     var point = model.Scene.child('marks.symbol');
//     point.bind('x', cars.f('Acceleration'));
//     test('x', done);
//   });

//   it('should bind y', function(done) {
//     var point = model.Scene.child('marks.symbol');
//     point.bind('y', cars.f('Acceleration'));
//     test('y', done);
//   });

//   it('should bind xy', function(done) {
//     var point = model.Scene.child('marks.symbol');
//     point.bind('x', cars.f('Acceleration'))
//       .bind('y', cars.f('Horsepower'));
//     test('xy', done);
//   });

//   it('should bind fill', function(done) {
//     var point = model.Scene.child('marks.symbol');
//     point.bind('x', cars.f('Acceleration'))
//       .bind('y', cars.f('Horsepower'))
//       .bind('fill', cars.f('Origin'));
//     test('fill', done);
//   });

//   it('should bind shape', function(done) {
//     var point = model.Scene.child('marks.symbol');
//     point.bind('x', cars.f('Acceleration'))
//       .bind('y', cars.f('Horsepower'))
//       .bind('shape', cars.f('Origin'));
//     test('shape', done);
//   });

//   it('should bind size', function(done) {
//     var point = model.Scene.child('marks.symbol');
//     point.bind('x', cars.f('Acceleration'))
//       .bind('y', cars.f('Horsepower'))
//       .bind('size', cars.f('Displacement'));
//     test('size', done);
//   });

//   it('should bind point', function(done) {
//     var point = model.Scene.child('marks.symbol');
//     point.bind('x', cars.f('Acceleration'))
//       .bind('y', cars.f('Horsepower'))
//       .bind('fill', cars.f('Origin'))
//       .bind('shape', cars.f('Origin'))
//       .bind('size', cars.f('Displacement'));
//     test('point', done);
//   });

//   it('should bind rect spatial properties');
// });
