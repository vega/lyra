describe('Primitive', function() {
  var Primitive = require('../src/js/model/primitives/Primitive.js'),
      dl = require('datalib'),
      model = require('../src/js/model/index.js'),
      prim;

  describe('Export', function() {
    beforeEach(function() {
      prim = new Primitive();
    });

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


  });
});
