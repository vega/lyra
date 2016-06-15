/* eslint no-unused-expressions:0, new-cap:0 */
'use strict';
var expect = require('chai').expect;
var Immutable = require('immutable');

var actions = require('../actions/Names');
var marksReducer = require('./marksReducer');
var markActions = require('../actions/markActions');
var createScene = require('../actions/sceneActions').createScene;
var counter = require('../util/counter');
var setIn = require('../util/immutable-utils').setIn;

describe('marks reducer', function() {
  var initialState, addMark;

  beforeEach(function() {
    initialState = Immutable.Map();
    addMark = markActions.addMark;
    // Reset counters module so that we can have predictable IDs for our new marks
    counter.reset();
  });

  it('is a function', function() {
    expect(marksReducer).to.be.a('function');
  });

  it('returns an immutable map if state is not defined', function() {
    var result = marksReducer();
    expect(Immutable.Map.isMap(result)).to.be.true;
    expect(result.size).to.equal(0);
  });

  it('does not mutate the state if an unrelated action is passed in', function() {
    var result = marksReducer(initialState, {
      type: 'NOT_A_RELEVANT_ACTION'
    });
    expect(initialState).to.equal(result);
  });

  describe('add mark action', function() {

    it('registers a mark in the store keyed by mark _id', function() {
      var result = marksReducer(initialState, addMark({
        type: 'rect'
      }));
      expect(result.size).to.equal(1);
      expect(result.get('1').toJS()).to.deep.equal({
        _id: 1,
        name: 'rect_1',
        type: 'rect'
      });
    });

    it('registers multiple marks on successive calls', function() {
      var result = marksReducer(marksReducer(marksReducer(initialState, addMark({
        type: 'rect'
      })), addMark({
        type: 'line'
      })), addMark({
        type: 'rect'
      }));
      expect(result.size).to.equal(3);
      expect(result.get('1').toJS()).to.deep.equal({
        _id: 1,
        name: 'rect_1',
        type: 'rect'
      });
      expect(result.get('2').toJS()).to.deep.equal({
        _id: 2,
        name: 'line_1',
        type: 'line'
      });
      expect(result.get('3').toJS()).to.deep.equal({
        _id: 3,
        name: 'rect_2',
        type: 'rect'
      });
    });

    it('stores vega property values as lyra signal references', function() {
      var result = marksReducer(initialState, addMark({
        type: 'symbol',
        properties: {
          update: {
            x: {value: 100},
            y: {value: 200},
            fill: {value: '#7B8B9D'}
          }
        }
      }));
      expect(result.get('1').toJS()).to.deep.equal({
        _id: 1,
        name: 'symbol_1',
        type: 'symbol',
        properties: {
          update: {
            x: {signal: 'lyra_symbol_1_x'},
            y: {signal: 'lyra_symbol_1_y'},
            fill: {signal: 'lyra_symbol_1_fill'}
          }
        }
      });
    });

    describe('parent-child relation', function() {
      var result;

      beforeEach(function() {
        // Start out with a store already containing a group mark
        initialState = marksReducer(Immutable.Map(), addMark({
          _id: 15,
          name: 'group_1',
          type: 'group',
          marks: []
        }));
        result = marksReducer(initialState, addMark({
          type: 'symbol',
          _id: 61,
          _parent: 15
        }));
      });

      it('sets a parent for the mark being added, if provided', function() {
        var childMark = result.get('61').toJS();
        expect(childMark).to.have.property('_parent');
        expect(childMark._parent).to.equal(15);
      });

      it('sets the mark being added as a child of the specified parent', function() {
        var parentGroup = result.get('15').toJS();
        expect(parentGroup).to.have.property('marks');
        expect(parentGroup.marks).to.deep.equal([61]);
      });

    });

  });

  describe('delete mark action', function() {

    beforeEach(function() {
      initialState = initialState
        .set('1', Immutable.fromJS({
          _id: 1,
          type: 'group',
          name: 'parent group',
          marks: [2, 3]
        }))
        .set('2', Immutable.fromJS({
          _id: 2,
          _parent: 1,
          type: 'group',
          name: 'branch group',
          marks: [4]
        }))
        .set('3', Immutable.fromJS({
          _id: 3,
          _parent: 1,
          type: 'rect',
          name: 'child of group 1'
        }))
        .set('4', Immutable.fromJS({
          _id: 4,
          _parent: 2,
          type: 'symbol',
          name: 'child of group 2'
        }));
    });

    it('nulls out the mark in the store', function() {
      var result = marksReducer(initialState, {
        type: actions.DELETE_MARK,
        markId: 4,
        markType: 'symbol'
      });
      expect(result.get('4')).to.equal(null);
    });

    it('removes the mark from its parent\'s marks array', function() {
      var result = marksReducer(initialState, {
        type: actions.DELETE_MARK,
        markId: 4,
        markType: 'symbol'
      });
      expect(result.get('2').toJS().marks).to.deep.equal([]);
    });

  });

  describe('create scene action', function() {

    it('registers the scene as a mark and initializes defaults', function() {
      var result = marksReducer(initialState, createScene()).get('1').toJS();
      expect(result).to.exist;
      expect(result).to.have.property('_id');
      expect(result._id).to.equal(1);
      expect(result).to.have.property('name');
      expect(result.name).to.equal('Scene');
      expect(result.type).to.equal('scene');
    });

    it('converts the scene height and width to signal references', function() {
      var result = marksReducer(initialState, createScene());
      expect(result.get('1').get('height').toJS()).to.deep.equal({
        signal: 'lyra_vis_height'
      });
      expect(result.get('1').get('width').toJS()).to.deep.equal({
        signal: 'lyra_vis_width'
      });
    });
  });

  describe('set parent action', function() {
    var setParent;

    beforeEach(function() {
      // Start out with a store already containing two groups and a symbol
      initialState = marksReducer(marksReducer(marksReducer(Immutable.Map(), addMark({
        _id: 15,
        name: 'group_1',
        type: 'group',
        marks: []
      })), addMark({
        _id: 22,
        name: 'group_2',
        type: 'group',
        marks: []
      })), addMark({
        type: 'symbol',
        name: 'symbol_1',
        _id: 61
      }));
      setParent = markActions.setParent;
    });

    it('establishes a parent-child relationship between the provided marks', function() {
      var result = marksReducer(initialState, setParent(61, 15)),
          symbol = result.get('61').toJS(),
          group1 = result.get('15').toJS();
      expect(symbol).to.have.property('_parent');
      expect(symbol._parent).to.equal(15);
      expect(group1).to.have.property('marks');
      expect(group1.marks).to.deep.equal([61]);
    });

    it('can move a mark from one group to another', function() {
      // Start with the symbol in group_1
      initialState = marksReducer(initialState, setParent(61, 15));
      // Move symbol to group_2
      var result = marksReducer(initialState, setParent(61, 22)),
          symbol = result.get('61').toJS(),
          group1 = result.get('15').toJS(),
          group2 = result.get('22').toJS();
      expect(group1.marks).to.deep.equal([]);
      expect(group2.marks).to.deep.equal([61]);
      expect(symbol._parent).to.equal(22);
    });

    it('can remove a mark from its parent', function() {
      // Start with the symbol in group_1
      initialState = marksReducer(initialState, setParent(61, 15));
      // Clear symbol's parent
      var result = marksReducer(initialState, setParent(61, null)),
          symbol = result.get('61').toJS(),
          group1 = result.get('15').toJS(),
          group2 = result.get('22').toJS();
      expect(group1.marks).to.deep.equal([]);
      expect(group2.marks).to.deep.equal([]);
      expect(symbol._parent).to.equal(null);
    });

  });

  describe('add scale to group action', function() {

    beforeEach(function() {
      // Start out with a store already containing a group
      initialState = marksReducer(Immutable.Map(), addMark({
        _id: 15,
        name: 'group_1',
        type: 'group',
        marks: [],
        scales: []
      }));
    });

    it('has no effect if the provided parent ID is not present in the store', function() {
      var result = marksReducer(initialState, {
        type: actions.RULES_ADD_SCALE_TO_GROUP,
        groupId: 51,
        id: 222
      });
      expect(result).to.equal(initialState);
    });

    it('adds the specified scale ID to the specified group\'s scales array', function() {
      var result = marksReducer(initialState, {
        type: actions.RULES_ADD_SCALE_TO_GROUP,
        groupId: 15,
        id: 222
      });
      expect(result.get('15').toJS().scales).to.deep.equal([222]);
    });

    it('does not overwrite any preexisting scale IDs in the group\'s scales array', function() {
      initialState = setIn(initialState, '15.scales', Immutable.fromJS([111]));
      expect(initialState.get('15').toJS().scales).to.deep.equal([111]);
      var result = marksReducer(initialState, {
        type: actions.RULES_ADD_SCALE_TO_GROUP,
        groupId: 15,
        id: 222
      });
      expect(result.get('15').toJS().scales).to.deep.equal([111, 222]);
    });

  });

  describe('add axis to group action', function() {

    beforeEach(function() {
      // Start out with a store already containing a group
      initialState = marksReducer(Immutable.Map(), addMark({
        _id: 15,
        name: 'group_1',
        type: 'group',
        marks: [],
        axes: []
      }));
    });

    it('has no effect if the provided parent ID is not present in the store', function() {
      var result = marksReducer(initialState, {
        type: actions.RULES_ADD_AXIS_TO_GROUP,
        groupId: 51,
        id: 222
      });
      expect(result).to.equal(initialState);
    });

    it('adds the specified axis ID to the specified group\'s axes array', function() {
      var result = marksReducer(initialState, {
        type: actions.RULES_ADD_AXIS_TO_GROUP,
        groupId: 15,
        id: 222
      });
      expect(result.get('15').toJS().axes).to.deep.equal([222]);
    });

    it('does not overwrite any preexisting axis IDs in the group\'s axes array', function() {
      initialState = setIn(initialState, '15.axes', Immutable.fromJS([111]));
      expect(initialState.get('15').toJS().axes).to.deep.equal([111]);
      var result = marksReducer(initialState, {
        type: actions.RULES_ADD_AXIS_TO_GROUP,
        groupId: 15,
        id: 222
      });
      expect(result.get('15').toJS().axes).to.deep.equal([111, 222]);
    });

    it('can move an axis from one group to another', function() {
      initialState = marksReducer(initialState, addMark({
        _id: 30,
        name: 'group_2',
        type: 'group',
        marks: [],
        axes: [111]
      }));
      expect(initialState.get('15').toJS().axes).to.deep.equal([]);
      expect(initialState.get('30').toJS().axes).to.deep.equal([111]);
      var result = marksReducer(initialState, {
        type: actions.RULES_ADD_AXIS_TO_GROUP,
        oldGroupId: 30,
        groupId: 15,
        id: 111
      });
      expect(result.get('15').toJS().axes).to.deep.equal([111]);
      expect(result.get('30').toJS().axes).to.deep.equal([]);
    });

  });

  describe('add legend to group action', function() {

    beforeEach(function() {
      // Start out with a store already containing a group
      initialState = marksReducer(Immutable.Map(), addMark({
        _id: 15,
        name: 'group_1',
        type: 'group',
        marks: [],
        legends: []
      }));
    });

    it('has no effect if the provided parent ID is not present in the store', function() {
      var result = marksReducer(initialState, {
        type: actions.RULES_ADD_LEGEND_TO_GROUP,
        groupId: 51,
        id: 222
      });
      expect(result).to.equal(initialState);
    });

    it('adds the specified legend ID to the specified group\'s legends array', function() {
      var result = marksReducer(initialState, {
        type: actions.RULES_ADD_LEGEND_TO_GROUP,
        groupId: 15,
        id: 222
      });
      expect(result.get('15').toJS().legends).to.deep.equal([222]);
    });

    it('does not overwrite any preexisting legend IDs in the group\'s legends array', function() {
      initialState = setIn(initialState, '15.legends', Immutable.fromJS([111]));
      expect(initialState.get('15').toJS().legends).to.deep.equal([111]);
      var result = marksReducer(initialState, {
        type: actions.RULES_ADD_LEGEND_TO_GROUP,
        groupId: 15,
        id: 222
      });
      expect(result.get('15').toJS().legends).to.deep.equal([111, 222]);
    });

    it('can move an legend from one group to another', function() {
      initialState = marksReducer(initialState, addMark({
        _id: 30,
        name: 'group_2',
        type: 'group',
        marks: [],
        legends: [111]
      }));
      expect(initialState.get('15').toJS().legends).to.deep.equal([]);
      expect(initialState.get('30').toJS().legends).to.deep.equal([111]);
      var result = marksReducer(initialState, {
        type: actions.RULES_ADD_LEGEND_TO_GROUP,
        oldGroupId: 30,
        groupId: 15,
        id: 111
      });
      expect(result.get('15').toJS().legends).to.deep.equal([111]);
      expect(result.get('30').toJS().legends).to.deep.equal([]);
    });

  });

  describe('property mutators', function() {

    beforeEach(function() {
      // Start out with a store already containing a rect
      initialState = marksReducer(Immutable.Map(), addMark({
        _id: 15,
        name: 'rect_1',
        type: 'rect',
        properties: {
          update: {
            height: {
              scale: 'height',
              field: 'price'
            }
          }
        }
      }));
      // Validate initial state
      expect(initialState.get('15').toJS().properties.update).to.deep.equal({
        height: {
          scale: 'height',
          field: 'price'
        }
      });
    });

    describe('set property action', function() {

      it('overwrites a property with the provided object', function() {
        var result = marksReducer(initialState, {
          type: actions.RULES_SET_PROPERTY,
          id: 15,
          property: 'height',
          value: {
            value: 155
          }
        });
        expect(result.get('15').toJS().properties.update).to.deep.equal({
          height: {
            value: 155
          }
        });
      });

      it('does not set the provided value object by reference', function() {
        var value = {
          signal: 'lyra_rect_15_height'
        };
        var result = marksReducer(initialState, {
          type: actions.RULES_SET_PROPERTY,
          id: 15,
          property: 'height',
          value: value
        });
        value.otherProp = 'something new';
        expect(result.get('15').toJS().properties.update).to.deep.equal({
          height: {
            signal: 'lyra_rect_15_height'
          }
        });
      });

    });

    describe('disable property action', function() {

      it('flags a property as _disabled', function() {
        var result = marksReducer(initialState, {
          type: actions.RULES_DISABLE_PROPERTY,
          id: 15,
          property: 'height'
        });
        expect(result.get('15').toJS().properties.update).to.deep.equal({
          height: {
            scale: 'height',
            field: 'price',
            _disabled: true
          }
        });
      });

    });

    describe('reset property action', function() {

      it('resets a property to its corresponding signal reference', function() {
        expect(initialState.get('15').toJS().properties.update).to.deep.equal({
          height: {
            scale: 'height',
            field: 'price'
          }
        });
        var result = marksReducer(initialState, {
          type: actions.RULES_RESET_PROPERTY,
          id: 15,
          property: 'height'
        });
        expect(result.get('15').toJS().properties.update).to.deep.equal({
          height: {
            signal: 'lyra_rect_15_height'
          }
        });
      });

      // @TODO: Is this desireable behavior? It seems in keeping with the currently
      // existing functionality but once a property has been disconnected, the
      // disabled state can never be recovered.
      it('overwrites property disabled state', function() {
        initialState = setIn(initialState, '15.properties.update.height._disabled', true);
        expect(initialState.get('15').toJS().properties.update).to.deep.equal({
          height: {
            scale: 'height',
            field: 'price',
            _disabled: true
          }
        });
        var result = marksReducer(initialState, {
          type: actions.RULES_RESET_PROPERTY,
          id: 15,
          property: 'height'
        });
        expect(result.get('15').toJS().properties.update).to.deep.equal({
          height: {
            signal: 'lyra_rect_15_height'
          }
        });
      });

    });

  });

  describe('update property action', function() {

    beforeEach(function() {
      // Start out with a store already containing a rect
      initialState = marksReducer(Immutable.Map(), addMark({
        _id: 15,
        name: 'rect_1',
        type: 'rect',
        properties: {
          update: {
            height: {
              signal: 'lyra_rect_15_height'
            }
          }
        }
      }));
      // Validate initial state
      expect(initialState.get('15').get('name')).to.equal('rect_1');
    });

    it('updates values on the relevant mark in the store', function() {
      var result = marksReducer(initialState, {
        type: actions.UPDATE_MARK_PROPERTY,
        id: 15,
        property: 'name',
        value: 'awesome_rectangle'
      });
      expect(result.get('15').get('name')).to.equal('awesome_rectangle');
    });

  });

  describe('remove mark action', function() {

    it('removes the mark from the store');

  });

});
