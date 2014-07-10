var Transform = vde.Vis.Transform;
var Field = vde.Vis.Field;

describe('Transform', function() {
  var transform;
  beforeEach(function() {
    test_util.jasmineMatchers();

    transform = new Transform('pipeline1', 'type', 'displayName', ['input'], ['output']);
  });

  describe('constructor', function() {
    it('should set the correct fields', function() {
      expect(transform).toHaveProperties({
        type: 'type',
        pipelineName: 'pipeline1',
        input: ['input'],
        output: ['output']
      })
    });
  });

  describe('pipeline', function() {
    it('should find the correct pipeline', function() {
      vde.Vis.pipelines = vde.Vis.pipelines || {};
      vde.Vis.pipelines['pipeline1'] = 'my pipeline';

      expect(transform.pipeline()).toBe('my pipeline');
    });
  });

  describe('spec', function() {
    it('should have the correct type', function() {
      transform.type = 'some type';
      expect(transform.spec().type).toBe('some type');
    });

    it('should have input values', function() {
      var fieldC = new Field('fieldName', 'data.', 'type', 'pipelineName');
      transform.input = ['a', 'b', 'c'];
      transform.properties = {
        a: 'value a',
        b: 'value b',
        c: fieldC,
        d: 'not present'
      };

      expect(transform.spec()).toHaveProperties({
        a: 'value a',
        b: 'value b',
        c: fieldC.spec()
      });
      expect(transform.spec()).not.toHaveProperties({
        d: 'not present'
      });
    });
  });

  describe('bindProperty', function() {
    it('should bind a field to a property', function() {
      var field = new Field('fieldName', 'data.', 'type', 'pipelineName');
      transform.bindProperty('property1', {field: field});

      expect(transform.properties.property1).toBe(field);
    });

    it('should ignore a blank field', function() {
      transform.bindProperty('property1', {});

      expect(transform.properties).toEqual({});
    });

    it('should copy a non-field object', function() {
      var field = {
        name: 'name',
        accessor: 'data.',
        type: 'type',
        pipelineName: 'pipeline1',
        stat: 'stat'
      };
      transform.bindProperty('property1', {field: field});

      expect(transform.properties.property1).not.toBe(field);
      expect(transform.properties.property1).toHaveProperties(field);
      expect(transform.properties.property1 instanceof vde.Vis.Field).toBe(true);
    });
  });

  describe('unbindProperty', function() {
    it('should delete properties', function() {
      transform.properties.testProp = 'test value';

      transform.unbindProperty('testProp');

      expect('testProp' in transform.properties).toBe(false);
    });
  });

  describe('transform', function() {
    it('should transform data', function() {
      var data = [{a: 1}, {a: 2}, {a: 3}];
      transform.type = 'filter';
      transform.bindProperty('test', {field:'d.data.a > 1'});
      transform.input = ['test'];

      expect(transform.transform(data)).toEqual([
        {a: 2},
        {a: 3}
      ]);
    });
  });
});