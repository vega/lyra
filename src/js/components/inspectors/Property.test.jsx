/* eslint no-unused-expressions:0,new-cap:0 */
'use strict';

var React = require('react'),
    expect = require('chai').expect,
    dl = require('datalib'),
    configureMockStore = require('redux-mock-store').default,
    Immutable = require('immutable'),
    enzyme = require('enzyme'),
    mount = enzyme.mount,
    Property = require('./Property'),
    resetMarkVisual = require('../../actions/markActions').resetMarkVisual,
    wrapper;

describe('Property Inspector <Property/>', function() {
  var mockStore;

  beforeEach(function() {
    // mockStore is a function that can be called with a default state object
    // to create a mock store instance which can be passed to a component via
    // the enzyme renderer's context option
    mockStore = configureMockStore([]);
  });

  describe('Basic input rendering', function() {
    it('renders a number input', function() {
      wrapper = mount(<Property name="x" label="X" type="number"
        min="5" max="20" disabled={true} />, {
          context: {store: mockStore({})}
        });

      expect(wrapper.find('input[type="number"]')).to.have.length(1);
      expect(wrapper.prop('min')).to.equal('5');
      expect(wrapper.prop('max')).to.equal('20');
      expect(wrapper.prop('disabled')).is.true;
    });

    it('renders a range input', function() {
      wrapper = mount(<Property name="opacity" label="Opacity" type="range"
        min="5" max="20" step="0.5" disabled={true} />, {
          context: {store: mockStore({})}
        });

      expect(wrapper.find('input[type="range"]')).to.have.length(1);
      expect(wrapper.prop('min')).to.equal('5');
      expect(wrapper.prop('max')).to.equal('20');
      expect(wrapper.prop('step')).to.equal('0.5');
      expect(wrapper.prop('disabled')).is.true;
    });

    it('renders a color input', function() {
      wrapper = mount(<Property name="fill" label="Fill" type="color"
        disabled={true} />, {
          context: {store: mockStore({})}
        });

      expect(wrapper.find('input[type="color"]')).to.have.length(1);
      expect(wrapper.prop('disabled')).is.true;
    });

    it('renders a text input', function() {
      wrapper = mount(<Property name="text" label="Text" type="text"
        disabled={true} />, {
          context: {store: mockStore({})}
        });

      expect(wrapper.find('input[type="text"]')).to.have.length(1);
      expect(wrapper.prop('disabled')).is.true;
    });

    it('renders a checkbox input', function() {
      wrapper = mount(<Property name="band" label="Automatic" type="checkbox"
        disabled={true} />, {
          context: {store: mockStore({})}
        });

      expect(wrapper.find('input[type="checkbox"]')).to.have.length(1);
      expect(wrapper.prop('disabled')).is.true;
    });

    it('renders a select', function() {
      wrapper = mount(<Property name="orient" label="Orient" type="select"
        opts={['Vertical', 'Horizontal']} />, {
          context: {store: mockStore({})}
        });

      expect(wrapper.find('select')).to.have.length(1);
      expect(wrapper.find('option')).to.have.length(2);
      expect(wrapper.find('option').at(0).prop('value')).to.equal('Vertical');
      expect(wrapper.find('option').at(1).prop('value')).to.equal('Horizontal');
    });
  });

  describe('Children elements', function() {
    it('renders a default label', function() {
      wrapper = mount(<Property name="x" label="X" type="number" />, {
        context: {store: mockStore({})}
      });

      expect(wrapper.find('label')).to.have.length(1);
      expect(wrapper.find('label').at(0).prop('htmlFor')).to.equal('x');
    });

    it('renders a custom label', function() {
      wrapper = mount(<Property name="x" label="X" type="number">
          <div className="label">X Position</div>
        </Property>, {
          context: {store: mockStore({})}
        });

      expect(wrapper.find('label')).to.have.length(0);
      expect(wrapper.find('div.label')).to.have.length(1);

      wrapper = mount(<Property name="x" label="X" type="number">
          <div className="label-long label">X Position</div>
        </Property>, {
          context: {store: mockStore({})}
        });

      expect(wrapper.find('label')).to.have.length(0);
      expect(wrapper.find('div.label')).to.have.length(1);
    });

    it('renders a custom control', function() {
      wrapper = mount(<Property name="x" label="X" type="number">
          <div className="control">X Position</div>
        </Property>, {
          context: {store: mockStore({})}
        });

      expect(wrapper.find('input')).to.have.length(0);
      expect(wrapper.find('div.control')).to.have.length(2);
    });

    it('renders an extra component', function() {
      wrapper = mount(<Property name="x" label="X" type="number">
          <div className="extra">Set to Group Width</div>
        </Property>, {
          context: {store: mockStore({})}
        });

      expect(wrapper.find('label')).to.have.length(1);
      expect(wrapper.find('input')).to.have.length(1);
      expect(wrapper.find('div.extra')).to.have.length(2);
    });

    it('identifies canDrop and firstChild', function() {
      wrapper = mount(<Property name="x" label="X" type="number"
        canDrop={true} firstChild={true} />, {
          context: {store: mockStore({})}
        });

      expect(wrapper.find('div.first-child')).to.have.length(1);
      expect(wrapper.find('div.can-drop')).to.have.length(1);
    });
  });

  describe('Bound data', function() {
    function store(props, prims) {
      return mockStore(Immutable.Map({
        vis: {
          present: Immutable.fromJS(dl.extend({
            marks: {
              '1': {
                properties: {
                  update: props
                }
              }
            }
          }, prims))
        }
      }));
    }

    it('renders a scale', function() {
      var state = store({x: {scale: 2}}, {
        scales: {
          '2': {name: 'xscale'}
        }
      });

      wrapper = mount(<Property name="x" label="X" type="number"
        primType="marks" primId="1" />, {
          context: {store: state}
        });

      expect(wrapper.find('div.scale')).to.have.length(1);
      expect(wrapper.find('div.scale').text()).to.equal('xscale');

      wrapper.find('div.scale').simulate('click');
      expect(state.getActions()[0]).to.deep.equal(resetMarkVisual('1', 'x'));
    });

    it('renders a field', function() {
      var state = store({y: {field: 'price'}});

      wrapper = mount(<Property name="y" label="Y" type="number"
        primType="marks" primId="1" />, {
          context: {store: state}
        });

      expect(wrapper.find('div.field')).to.have.length(1);
      expect(wrapper.find('div.field').text()).to.equal('price');

      wrapper.find('div.field').simulate('click');
      expect(state.getActions()[0]).to.deep.equal(resetMarkVisual('1', 'y'));
    });

    it('renders a value', function() {
      wrapper = mount(<Property name="title" label="Text" type="text"
        primType="guides" primId="2" />, {
          context: {
            store: store({}, {
              guides: {
                '2': {title: 'country'}
              }
            })
          }
        });

      expect(wrapper.find('input').prop('value')).to.equal('country');
    });

    it.skip('renders a signal value', function() {
      wrapper = mount(<Property name="x" label="X" type="number"
        primType="marks" primId="1" />, {
          context: {
            store: store({x: {signal: 'lyra_test_signal'}}, {
              signals: {
                lyra_test_signal: {init: 55}
              }
            })
          }
        });

      expect(wrapper.find('input').prop('value')).to.equal('55');
    });
  });
});
