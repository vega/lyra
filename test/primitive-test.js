describe('Primitive', function() {
  var Primitive = require(src+'model/primitives/Primitive'),
      prim;

  beforeEach('new Primitives', function() {
    prim = new Primitive();
  });

  describe('Export', function() {
    it('should duplicate properties', function() {
      var props = {
        hello: 'world',
        foo: 1,
        bar: {
          nested: {value: 2}
        }
      };

      dl.extend(prim, props);
      expect(prim.export()).to.deep.equal(props);
    });

    it('should remove private properties', function() {
      var props = {
        hello: 'world',
        foo: 1,
        bar: 2,
        _priv1: 'secret',
        _priv2: 'messages'
      };

      dl.extend(prim, props);

      var ex = prim.export();
      expect(ex).to.have.keys(['hello', 'foo', 'bar']);
      expect(ex).to.not.have.keys(['_priv1', '_priv2']);
    });

    it('should remove _disabled properties', function() {
      var props = {
        hello: 'world',
        foo: 1,
        bar: 2,
        _priv1: 'secret',
        _priv2: 'message',
        priv3: {value: 'bad', _disabled: true},
        priv4: {signal: 'settings', _disabled: true}
      };

      dl.extend(prim, props);

      var ex = prim.export();
      expect(ex).to.have.keys(['hello', 'foo', 'bar']);
      expect(ex).to.not.have.keys(['_priv1', '_priv2', 'priv3', 'priv4']);
    });

    it('should recursively cleanup', function() {
      var props = {
        hello: 'world',
        foo: 1,
        bar: {
          baz: {value: 'foo'},
          _priv1: 'secret'
        },
        _priv2: 'message',
        priv3: {value: 'bad', _disabled: true},
        properties: {
          enter: {
            priv4: {value: 'settings', _disabled: true},
            _priv5: 5
          }
        }
      };

      dl.extend(prim, props);

      var ex = prim.export();
      expect(ex).to.have.keys(['hello', 'foo', 'bar', 'properties']);
      expect(ex).to.not.have.keys(['_priv2', 'priv3']);
      expect(ex.bar).to.have.keys(['baz']);
      expect(ex.bar).to.not.have.keys(['_priv1']);
      expect(ex.properties.enter).to.be.empty;
    });

    it('should resolve signals', function() {
      var props = {
        a: {signal: 'lyra_manipulators'},
        b: {
          signal: 'lyra_manipulators',
          _disabled: true
        },
        c: {
          d: {
            signal: 'lyra_selected'
          },
          _e: false
        }
      };

      dl.extend(prim, props);

      var ex = prim.export(),
          manipulators = model.signal('lyra_manipulators'),
          selected = model.signal('lyra_selected');
      expect(ex).to.have.keys(['a', 'c']);
      expect(ex.a).to.equal(manipulators);
      expect(ex.c).to.have.keys(['d']);
      expect(ex.c.d).to.deep.equal(selected);

      var ex = prim.export(true);
      expect(ex).to.have.keys(['a', 'c']);
      expect(ex.a).to.equal(manipulators);
      expect(ex.c).to.have.keys(['d']);
      expect(ex.c.d).to.deep.equal(selected);

      var ex = prim.export(false);
      expect(ex).to.have.keys(['a', 'c']);
      expect(ex.a).to.deep.equal({signal: 'lyra_manipulators'});
      expect(ex.c).to.have.keys(['d']);
      expect(ex.c.d).to.deep.equal({signal: 'lyra_selected'});
    });
  });
});
