var Scale = vde.Vis.Scale;

describe('Scale', function() {
  var scale;

  beforeEach(function() {
    test_util.jasmineMatchers();

    scale = new Scale('name', {name:'pipeline1', scales:{}}, {}, 'displayName');
  });

  describe('constructor', function() {
    it('should set the correct values', function() {
      expect(scale).toHaveProperties({
        name: 'name',
        displayName: 'displayName',
        pipelineName: 'pipeline1'
      });
    });

    it('should set default values', function() {
      scale = new Scale('name', {name: 'pipeline1', scales:{}}, {
        a: 'value a',
        properties: {
          b: 'value b'
        }
      }, 'displayName');

      expect(scale).toHaveProperties({
        a: 'value a',
        properties: {
          b: 'value b'
        }
      });
    });

    it('should add itself to the pipeline', function() {
      var pipeline = {name: 'pipeline1', scales: {}};
      scale = new Scale('name', pipeline, {}, 'displayName');

      expect(pipeline.scales['name']).toBe(scale);
    });
  });

  describe('spec', function() {
    beforeEach(function() {
      vde.Vis.callback.clearAll();
      vde.Vis.pipelines = vde.Vis.pipelines || {};
      vde.Vis.pipelines['pipeline1'] = {myPipeline: true};
    });
    afterEach(function() {
      vde.Vis.callback.clearAll();
    });

    it('should run pre and post spec callbacks', function() {
      var cb1 = jasmine.createSpy();
      var cb2 = jasmine.createSpy();

      vde.Vis.callback.register('scale.pre_spec', scale, cb1);
      vde.Vis.callback.register('scale.post_spec', scale, cb2);

      scale.spec();

      expect(cb1).toHaveBeenCalled();
      expect(cb2).toHaveBeenCalled();
    });

    it('shoud copy properties', function() {
      scale.properties.testProp = 'test value';

      expect(scale.spec().testProp).toBe('test value');
    });

    it('should not have a pipeline or a field', function() {
      scale.properties = {
        pipeline: 'a value',
        field: 'a value'
      };
      var spec = scale.spec();

      expect('pipeline' in spec).toBe(false);
      expect('field' in spec).toBe(false);
    });
  });

  describe('equals', function() {
    it('should find matches for all properties in b', function() {
      var scale1 = {a: 'a value', b: 'b value', c: 'c value'};
      var scale2 = {a: 'a value'};

      expect(scale.equals.call(scale1, scale2)).toBe(true);
      expect(scale.equals.call(scale2, scale1)).toBe(false);
    });
  });


  describe('bindProperty', function() {
    it('should bind a field to a property', function() {
      var field = new Field('fieldName', 'data.', 'type', 'pipelineName');
      scale.bindProperty('property1', {field: field});

      expect(scale.property1).toBe(field);
    });

    it('should ignore a blank field', function() {
      scale.bindProperty('property1', {});

      expect('property1' in scale).toBe(false);
    });

    it('should copy a non-field object', function() {
      var field = {
        name: 'name',
        accessor: 'data.',
        type: 'type',
        pipelineName: 'pipeline1',
        stat: 'stat'
      };
      scale.bindProperty('property1', {field: field});

      expect(scale.property1).not.toBe(field);
      expect(scale.property1).toHaveProperties(field);
      expect(scale.property1 instanceof vde.Vis.Field).toBe(true);
    });
  });

  describe('unbindProperty', function() {
    it('should delete properties', function() {
      scale.testProp = 'test value';

      scale.unbindProperty('testProp');

      expect('testProp' in scale).toBe(false);
    });
  });
});