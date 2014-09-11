var parse = vde.Vis.parse;

function fill(spec) {
  spec.data = spec.data || [];
  spec.scales = spec.scales || [];
  return spec;
}

describe("Parser", function() {
  var Field = vde.Vis.Field;

  beforeEach(function() {
    test_util.jasmineMatchers();
  });

  describe("Fields", function() {
    var pipeline, examples = [
      {
        msg: 'should allow access on data',
        text: 'data.x',
        props: new Field('x', 'data.', null, 'pipeline1')
      },
      {
        msg: 'should allow bare fields',
        text: 'startAngle',
        props: new Field('startAngle', '', null, 'pipeline1')
      },
      {
        msg: 'should rename stats fields',
        text: 'stats.foo',
        props: new Field('y', 'stats.', null, 'pipeline2', 'sum'),
        pipeline: {
          name:'pipeline2',
          transforms:[
            {type:'stats', properties: {
              field: {name: 'y'}
            }}
          ],
          renamedStatsFields: {
            foo: 'sum'
          }
        }
      },
      {
        msg: 'should ignore d.',
        text: 'd.data.foo',
        props: new Field('foo', 'data.', null, 'pipeline1')
      }
    ];

    beforeEach(function() {
      pipeline = {
        name: 'pipeline1',
        transforms: []
      };
    });

    examples.forEach(function(example) {
      it(example.msg, function() {
        var field = parse.field(example.text, example.pipeline || pipeline);
        expect(field).toHaveProperties(example.props);
      });
    });
  });

  describe("ValueRefs", function() {
    var mark;

    beforeEach(function() {
      mark = {
        pipeline: function() {
          return {
            name: 'pipeline1',
            transforms: []
          };
        },
        group: function() {
          return {
            scales: {
              x: 'x scale'
            },
            group: function() {
              return {
                scales: {
                  y: 'y scale'
                }
              };
            }
          };
        }
      };
    });

    it('should copy the input', function() {
      var input = {value: 100},
          output = parse.valueRef(input);
      input.foo = 'bar';
      expect(output.foo).toBeUndefined();
    });

    it('should pass through values', function() {
      var examples = [{value: 100}, {value:'auto'}, {value: 'string'}];
      examples.forEach(function(example) {
        expect(parse.valueRef(example)).toEqual(example);
      });
    });

    it('should default to data as the field', function() {
      expect(parse.valueRef({}, mark).field).toHaveProperties({
        name: 'data',
        accessor: ''
      });
    });

    describe('unsupported properties', function() {
      var oldFail, fail;
      beforeEach(function() {
        oldFail = parse.fail;
        parse.fail = fail = jasmine.createSpy();
      });

      afterEach(function() {
        parse.fail = oldFail;
      });

      [
        {group:'width'},
        {mult:0.5},
        {group:'height', mult: 0.1},
        {value: 100, group: 'x'}
      ].forEach(function(example) {
        it('should fail on this example', function() {
          parse.valueRef(example, mark);
          expect(fail).toHaveBeenCalled();
        });
      });
    });

    it('should lookup scales in group or layer', function() {
      var result1 = parse.valueRef({
            value: 100,
            scale: 'x'
          }, mark),
          result2 = parse.valueRef({
            value: 100,
            scale: 'y'
          }, mark);

      expect(result1.scale).toBe('x scale');
      expect(result2.scale).toBe('y scale');
    });

    it('should replace "band" with value:"auto"', function() {
      expect(parse.valueRef({band:true}, mark).value).toBe('auto');
    });
  });

  describe("Data source normalization", function() {
    beforeEach(function() {
      parse.init();
    });

    it('should correct data sources to map to pipelines', function() {
      expect(parse.dataSources({
        data: [
          {name: 'simple', values: [0,1,2]},
          {name: 'with transform', values: [3,4,5], transform:[
            {type: 'sort', by:'-data'}
          ]},
          {name: 'with transform2', source:'simple', transform:[
            {type: 'stats', value: 'data'}
          ]},
          {name: 'with source', source: 'simple'},
          {name: 'sourced from transform', source: 'with transform'},
          {name: 'sourced from sourced', source: 'with source'},
          {
            name: 'fork (start)',
            'lyra.for': 'with transform',
            'lyra.role': 'fork',
            'lyra.start':true,
            transform: [
              {type: 'facet', keys: ['data']}
            ]
          },
          {
            name: 'fork (replace)',
            'lyra.for': 'with transform2',
            'lyra.role': 'fork',
            'lyra.start':true,
            transform: [
              {type: 'stats', value: 'data'},
              {type: 'facet', keys: ['data']},
            ]
          },
          {name: 'duplicates', source: 'simple', transform: [
            {type: 'sort', by: '-data'},
            {type: 'sort', by: '-data'},
            {type: 'sort', by: 'data'},
            {type: 'sort', by: 'data'}
          ]}
        ],
        marks: [
          {
            name: 'mark1',
            from: {
              data: 'simple',
              transform: [
                {type: 'filter', 'for': 'data'}
              ]
            }
          }
        ]
      })).toHaveProperties({
        data: [
          {name: 'simple', values: [0,1,2]},
          {name: 'with transform', values: [3,4,5], transform:[
            {type: 'sort', by:'-data'},
            {type: 'facet', keys: ['data']}
          ]},
          {name: 'with transform2', source: 'simple', transform: [
            {type: 'stats', value: 'data'},
            {type: 'facet', keys: ['data']},
          ]},
          {name: 'with source', source: 'simple'},
          {name: 'sourced from transform', source: 'with transform', transform: [
            {type: 'sort', by: '-data'},
          ]},
          {name: 'sourced from sourced', source: 'simple'},
          {name: 'duplicates', source: 'simple', transform: [
            {type: 'sort', by: '-data'},
            {type: 'sort', by: 'data'},
          ]},
          {source: 'simple', transform: [
            {type: 'filter', for: 'data'}
          ]}
        ]
      })
    })
  });
});