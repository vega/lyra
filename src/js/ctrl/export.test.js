'use strict';
var expect = require('chai').expect,
    Immutable = require('immutable'),
    dl = require('datalib'),
    signal = require('./signals'),
    counter = require('../util/counter'),
    dsUtil = require('../util/dataset-utils'),
    exporter = require('./export'),
    store = require('../store'),
    sortDataset = require('../actions/datasetActions').sortDataset;

/* eslint new-cap:0 */
function historyWrap(map) {
  return Immutable.Map({
    vis: {present: map}
  });
}

describe('Exporter Utility', function() {
  beforeEach(function() {
    counter.reset();
    dsUtil.reset();
  });

  describe('Pipelines', function() {
    var state = {
      pipelines: {
        '1': {
          _id: 1,
          name: 'carsPipeline',
          _source: 2
        },
        '5': {
          _id: 5,
          name: 'jobsPipeline',
          _source: 4
        }
      },
      datasets: {
        '2': {
          _id: 2,
          name: 'cars dataset',
          url: '/data/cars.json',
          format: {type: 'json'}
        },
        '3': {
          _id: 3,
          name: 'gapminder dataset',
          source: 2
        },
        '4': {
          _id: 4,
          name: 'jobs dataset',
          format: {type: 'json'}
        }
      },
      values: [
        [{a: 1}, {b: 2}, {c: 3}],
        [{d: 4}, {e: 5}, {f: 6}]
      ]
    };

    var imstate = historyWrap(Immutable.fromJS(state));

    beforeEach(function() {
      dsUtil.init({
        id: 2,
        props: state.datasets['2'],
        values: state.values[0]
      });

      dsUtil.init({
        id: 3,
        props: state.datasets['3']
      });

      dsUtil.init({
        id: 4,
        props: state.datasets['4'],
        values: state.values[1]
      });
    });

    describe('Datasets', function() {
      it('exports remote datasets', function() {
        var spec = exporter.dataset(imstate, false, 2);
        expect(spec).to.deep.equal({
          name: 'cars_dataset', url: '/data/cars.json', format: {type: 'json'}
        });
      });

      it('exports and embeds remote datasets', function() {
        var spec = exporter.dataset(imstate, true, 2);
        expect(spec).to.deep.equal({
          name: 'cars_dataset', values: state.values[0]
        });
      });

      it('exports sourced datasets', function() {
        var truth = {name: 'gapminder_dataset', source: 'cars_dataset'};
        expect(exporter.dataset(imstate, false, 3)).to.deep.equal(truth);
        expect(exporter.dataset(imstate, true, 3)).to.deep.equal(truth);
      });

      it('exports raw datasets', function() {
        expect(exporter.dataset(imstate, false, 4)).to.deep.equal({
          name: 'jobs_dataset',
          values: state.values[1],
          format: {type: 'json'}
        });

        expect(exporter.dataset(imstate, true, 4)).to.deep.equal({
          name: 'jobs_dataset',
          values: state.values[1]
        });
      });

      it('exports dataset with sort', function() {
        var id = 4,
            sortField = 'testField',
            sortOrder = 'inc';
        store.dispatch(sortDataset(id, sortField, sortOrder));

        expect(exporter.dataset(imstate, false, 4)).to.deep.equal({
          name: 'jobs_dataset',
          values: state.values[1],
          transform: [{'type': 'sort', 'by': 'testField'}],
          format: {type: 'json'},
        });
      });
    });

    it('exports all pipelines', function() {
      expect(exporter.pipelines(imstate, true)).to.deep.equal([
        {name: 'cars_dataset', values: state.values[0]},
        {name: 'jobs_dataset', values: state.values[1]}
      ]);

      expect(exporter.pipelines(imstate, false)).to.deep.equal([
        {name: 'cars_dataset', url: '/data/cars.json', format: {type: 'json'}},
        {name: 'jobs_dataset', values: state.values[1], format: {type: 'json'}}
      ]);
    });
  });

  describe('Marks', function() {
    function store(mark) {
      return historyWrap(Immutable.fromJS({
        datasets: {'1': {name: 'cars dataset'}},
        scales: {'2': {name: 'x scale'}, '3': {name: 'y scale'}},
        marks: mark
      }));
    }

    it('exports from dataset', function() {
      var state = store({
        '4': {
          _id: 4, name: 'Rect One', type: 'rect',
          from: {data: '1'},
          properties: {update: {}}
        }
      });

      var spec  = exporter.mark(state, false, 4),
          truth = {
            name: 'Rect_One', type: 'rect',
            from: {data: 'cars_dataset'},
            properties: {update: {}}
          };

      expect(spec).to.deep.equal(truth);

      spec = exporter.mark(state, true, 4);
      expect(spec.length).to.be.greaterThan(1); // Manipulators!
      expect(spec[0]).to.deep.equal(dl.extend({lyra_id: 4}, truth));
    });

    it('exports from mark', function() {
      var state = store({
        '4': {_id: 4, name: 'Symbol Two', type: 'symbol'},
        '5': {
          _id: 5, name: 'Rect One', type: 'rect',
          from: {mark: '4'},
          properties: {update: {}}
        }
      });

      var spec1 = exporter.mark(state, false, 5),
          spec2 = exporter.mark(state, true, 5);
      expect(spec1).to.have.deep.property('from.mark', 'Symbol_Two');
      expect(spec2.length).to.be.greaterThan(1); // Manipulators!
      expect(spec2[0]).to.have.deep.property('from.mark', 'Symbol_Two');
    });

    describe('Mark Properties', function() {
      var state;
      beforeEach(function() {
        state = store({
          '4': {
            _id: 4, name: 'Rect One', type: 'rect',
            properties: {
              update: {
                x: {group: 'width'},
                x2: {scale: '2', group: 'height'},
                y: {scale: '3', field: 'MPG'},
                y2: {scale: '3', signal: 'lyra_rect_4_y2'},
                fill: {signal: 'lyra_rect_4_fill'}
              }
            }
          }
        });

        signal.init('lyra_rect_4_y2', 25);
        signal.init('lyra_rect_4_fill', '#00FF00');
      });

      it('exports and resolves mark properties', function() {
        var spec = exporter.mark(state, false, 4);
        expect(spec).to.deep.equal({
          name: 'Rect_One', type: 'rect',
          properties: {
            update: {
              x: {field: {group: 'width'}},
              x2: {scale: 'x_scale', field: {group: 'height'}},
              y: {scale: 'y_scale', field: 'MPG'},
              y2: {scale: 'y_scale', value: 25},
              fill: {value: '#00FF00'}
            }
          }
        });
      });

      it('exports but does not resolve mark properties', function() {
        var spec = exporter.mark(state, true, 4);
        expect(spec.length).to.be.greaterThan(1); // Manipulators!
        expect(spec[0]).to.deep.equal({
          name: 'Rect_One', type: 'rect', lyra_id: 4,
          properties: {
            update: {
              x: {field: {group: 'width'}},
              x2: {scale: 'x_scale', field: {group: 'height'}},
              y: {scale: 'y_scale', field: 'MPG'},
              y2: {scale: 'y_scale', signal: 'lyra_rect_4_y2'},
              fill: {signal: 'lyra_rect_4_fill'}
            }
          }
        });
      });
    });

    it('exports area marks with backing data', function() {
      var state = store({
        '4': {
          _id: 4, name: 'Area One', type: 'area',
          from: {data: '1'},
          properties: {update: {orient: {value: 'horizontal'}}}
        }
      });

      var spec = exporter.area(state, false, 4);
      expect(spec).to.have.deep.property('from.data', 'cars_dataset');
      expect(spec.properties.update).to.deep.equal({orient: {value: 'horizontal'}});
    });

    it('exports area marks with dummy data', function() {
      var state = store({
        '4': {
          _id: 4, name: 'Area One', type: 'area',
          properties: {update: {orient: {value: 'horizontal'}}}
        }
      });

      var spec = exporter.area(state, false, 4);
      expect(spec).to.have.deep.property('from.data', 'dummy_data_area');
      expect(spec.properties.update).to.deep.equal({
        x: {field: 'x'}, y: {field: 'y'}, orient: {value: 'horizontal'}
      });
    });

    it('exports area marks with orientation', function() {
      var orient = {value: 'horizontal'},
          state = {
            '4': {
              _id: 4, name: 'Area One', type: 'area',
              properties: {update: {
                x: {}, y: {}, y2: {}, x2: {},
                orient: orient
              }}
            }
          };

      var spec = exporter.area(store(state), false, 4);
      expect(spec).to.have.deep.property('properties.update.orient.value', 'horizontal');
      expect(spec).to.have.deep.property('properties.update.x');
      expect(spec).to.have.deep.property('properties.update.x2');
      expect(spec).to.have.deep.property('properties.update.y');
      expect(spec).to.not.have.deep.property('properties.update.y2');

      orient.value = 'vertical';
      spec = exporter.area(store(state), false, 4);
      expect(spec).to.have.deep.property('properties.update.orient.value', 'vertical');
      expect(spec).to.have.deep.property('properties.update.x');
      expect(spec).to.not.have.deep.property('properties.update.x2');
      expect(spec).to.have.deep.property('properties.update.y');
      expect(spec).to.have.deep.property('properties.update.y2');
    });

    it('exports line marks with backing data', function() {
      var state = store({
        '4': {
          _id: 4, name: 'Line One', type: 'line',
          from: {data: '1'},
          properties: {update: {}}
        }
      });

      var spec = exporter.line(state, false, 4);
      expect(spec).to.have.deep.property('from.data', 'cars_dataset');
      expect(spec.properties.update).to.deep.equal({});
    });

    it('exports line marks with dummy data', function() {
      var state = store({
        '4': {
          _id: 4, name: 'Line One', type: 'line',
          properties: {update: {}}
        }
      });

      var spec = exporter.line(state, false, 4);
      expect(spec).to.have.deep.property('from.data', 'dummy_data_line');
      expect(spec.properties.update).to.deep.equal({
        x: {field: 'foo'}, y: {field: 'bar'}
      });
    });
  });

  describe('Scales', function() {
    function store(scale) {
      return historyWrap(Immutable.fromJS({
        datasets: {'1': {name: 'cars dataset'}},
        scales: scale
      }));
    }

    it('exports scales with a literal domain', function() {
      var state = store({
        '2': {name: 'x scale', domain: [1, 2, 3]}
      });

      var spec = exporter.scale(state, false, 2);
      expect(spec).to.deep.equal({
        name: 'x_scale', domain: [1, 2, 3]
      });
    });

    it('exports scales with a literal range', function() {
      var state = store({
        '2': {name: 'x scale', range: [1, 300]},
        '3': {name: 'y scale', range: 'height'}
      });

      var spec = exporter.scale(state, false, 2);
      expect(spec).to.deep.equal({
        name: 'x_scale', range: [1, 300]
      });

      spec = exporter.scale(state, false, 3);
      expect(spec).to.deep.equal({
        name: 'y_scale', range: 'height'
      });
    });

    it('exports scales with a dataref domain', function() {
      var state = store({
        '2': {name: 'x scale', _domain: [{data: '1', field: 'MPG'}]}
      });

      var spec = exporter.scale(state, false, 2);
      expect(spec).to.deep.equal({
        name: 'x_scale', domain: {data: 'cars_dataset', field: 'MPG'}
      });
    });

    it('exports scales with a dataref range', function() {
      var state = store({
        '2': {name: 'x scale', _range: [{data: '1', field: 'MPG'}]}
      });

      var spec = exporter.scale(state, false, 2);
      expect(spec).to.deep.equal({
        name: 'x_scale', range: {data: 'cars_dataset', field: 'MPG'}
      });
    });

    it('exports scales with multi-dataref domain/range');
  });

  describe('Group Marks', function() {
    var state = historyWrap(Immutable.fromJS({
      datasets: {'1': {name: 'cars dataset'}},
      scales: {
        '2': {name: 'x scale', _domain: [{data: '1', field: 'MPG'}]},
        '3': {name: 'y scale', range: 'height'}
      },
      guides: {
        '7': {_gtype: 'axis', type: 'x', scale: '2'},
        '8': {_gtype: 'legend', _type: 'fill', fill: '3'}
      },
      marks: {
        '4': {
          name: 'group mark',
          type: 'group',
          from: {data: '1'},
          scales: [2],
          axes: [7],
          legends: [],
          marks: [5],
          properties: {update: {}}
        },
        '5': {
          name: 'group mark 2',
          type: 'group',
          scales: [3],
          axes: [],
          legends: [8],
          marks: [6],
          properties: {update: {}}
        },
        '6': {
          name: 'Rect One', type: 'rect',
          properties: {
            update: {
              x: {group: 'width'},
              x2: {scale: '2', group: 'height'},
              y: {scale: '3', field: 'MPG'},
              y2: {scale: '3', signal: 'lyra_rect_4_y2'},
              fill: {signal: 'lyra_rect_4_fill'}
            }
          }
        }
      }
    }));

    signal.init('lyra_rect_4_y2', 25);
    signal.init('lyra_rect_4_fill', '#00FF00');

    it('exports nested group marks', function() {
      var spec = exporter.group(state, false, 4);
      expect(spec).to.deep.equal({
        name: 'group_mark',
        type: 'group',
        from: {data: 'cars_dataset'},
        properties: {update: {}},
        scales: [
          {name: 'x_scale', domain: {data: 'cars_dataset', field: 'MPG'}}
        ],
        axes: [{type: 'x', scale: 'x_scale'}],
        legends: [],
        marks: [{
          name: 'group_mark_2',
          type: 'group',
          properties: {update: {}},
          scales: [
            {name: 'y_scale', range: 'height'}
          ],
          axes: [],
          legends: [{fill: 'y_scale'}],
          marks: [{
            name: 'Rect_One',
            type: 'rect',
            properties: {
              update: {
                x: {field: {group: 'width'}},
                x2: {scale: 'x_scale', field: {group: 'height'}},
                y: {scale: 'y_scale', field: 'MPG'},
                y2: {scale: 'y_scale', value: 25},
                fill: {value: '#00FF00'}
              }
            }
          }]
        }]
      });
    });

    it('exports the scene', function() {
      state = state.get('vis').present;
      state = historyWrap(state.mergeDeep({
        scene: {id: 4},
        marks: {
          '4': {
            width: 200,
            height: 300
          }
        }
      }));

      var spec = exporter.scene(state, false);
      expect(spec).to.deep.equal({
        name: 'group_mark',
        width: 200,
        height: 300,
        scales: [
          {name: 'x_scale', domain: {data: 'cars_dataset', field: 'MPG'}}
        ],
        axes: [{type: 'x', scale: 'x_scale'}],
        legends: [],
        marks: [{
          name: 'group_mark_2',
          type: 'group',
          properties: {update: {}},
          scales: [
            {name: 'y_scale', range: 'height'}
          ],
          axes: [],
          legends: [{fill: 'y_scale'}],
          marks: [{
            name: 'Rect_One',
            type: 'rect',
            properties: {
              update: {
                x: {field: {group: 'width'}},
                x2: {scale: 'x_scale', field: {group: 'height'}},
                y: {scale: 'y_scale', field: 'MPG'},
                y2: {scale: 'y_scale', value: 25},
                fill: {value: '#00FF00'}
              }
            }
          }]
        }]
      });

      // Width/height signals should be resolved even if we're internal.
      spec = exporter.scene(state, true);
      expect(spec).to.have.property('width', 200);
      expect(spec).to.have.property('height', 300);
    });
  });
});
