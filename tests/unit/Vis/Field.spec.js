var Field = vde.Vis.Field;

describe("Field", function() {
  var field;
  beforeEach(function() {
    test_util.jasmineMatchers();
  });

  describe('constructor', function() {
    it('should copy a field', function() {
      var field1 = new Field('name', 'data.', 'type', 'pipeline');
      var field = new Field(field1);

      expect(field).toHaveProperties({
        name: 'name',
        accessor: 'data.',
        type: 'type',
        pipelineName: 'pipeline'
      });
    });
  });

  describe('spec', function() {
    it('should show stats', function() {
      field = new Field('name', 'data.', 'type', 'pipeline', 'mean');
      expect(field.spec()).toBe("stats.mean_name");
    });

    it('should show data', function() {
      field = new Field('name', 'data.', 'type', 'pipeline');
      expect(field.spec()).toBe('data.name');
    });
  })
});