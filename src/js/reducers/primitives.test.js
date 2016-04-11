/* eslint no-unused-expressions:0, new-cap:0 */
'use strict';
var expect = require('chai').expect;
var Immutable = require('immutable');

var actions = require('../constants/actions');
var primitivesReducer = require('./primitives');
var primitiveActions = require('../actions/primitiveActions');
var createScene = require('../actions/createScene');
var counter = require('../util/counter');
var setIn = require('../util/immutable-utils').setIn;

describe.only('primitives reducer', function() {
  var initialState;

  beforeEach(function() {
    initialState = Immutable.Map();
  });

  it('is a function', function() {
    expect(primitivesReducer).to.be.a('function');
  });

  it('returns an immutable map if state is not defined', function() {
    var result = primitivesReducer();
    expect(Immutable.Map.isMap(result)).to.be.true;
    expect(result.size).to.equal(0);
  });

  it('does not mutate the state if an unrelated action is passed in', function() {
    var result = primitivesReducer(initialState, {
      type: 'NOT_A_RELEVANT_ACTION'
    });
    expect(initialState).to.equal(result);
  });

  describe('add primitive action', function() {
    var addMark;

    beforeEach(function() {
      // Reset counters module so that we can have predictable IDs for our new marks
      counter.reset();
      addMark = primitiveActions.addMark;
    });

    it('registers a primitive in the store keyed by primitive _id', function() {
      var result = primitivesReducer(initialState, addMark({
        type: 'rect'
      }));
      expect(result.size).to.equal(1);
      expect(result.get('1').toJS()).to.deep.equal({
        _id: 1,
        name: 'rect_1',
        type: 'rect'
      });
    });

    it('registers multiple primitives on successive calls', function() {
      var result = primitivesReducer(primitivesReducer(primitivesReducer(initialState, addMark({
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
      var result = primitivesReducer(initialState, addMark({
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
        initialState = primitivesReducer(Immutable.Map(), addMark({
          _id: 15,
          name: 'group_1',
          type: 'group',
          marks: []
        }));
        result = primitivesReducer(initialState, addMark({
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

  describe('delete primitive action', function() {

    beforeEach(function() {
      // Reset counters module so that we can have predictable IDs for our new marks
      counter.reset();
      initialState = initialState
        .set('1', Immutable.Map({
          _id: 1,
          type: 'group',
          name: 'parent group',
          marks: [2, 3]
        }))
        .set('2', Immutable.Map({
          _id: 2,
          _parent: 1,
          type: 'group',
          name: 'branch group',
          marks: [4]
        }))
        .set('3', Immutable.Map({
          _id: 3,
          _parent: 1,
          type: 'rect',
          name: 'child of group 1'
        }))
        .set('4', Immutable.Map({
          _id: 4,
          _parent: 2,
          type: 'symbol',
          name: 'child of group 2'
        }));
    });

    it('nulls out the primitive in the store', function() {
      var result = primitivesReducer(initialState, {
        type: actions.PRIMITIVE_DELETE_MARK,
        markId: 4,
        markType: 'symbol'
      });
      expect(result.get('4')).to.equal(null);
    });

    it('removes the primitive from its parent\'s marks array', function() {
      var result = primitivesReducer(initialState, {
        type: actions.PRIMITIVE_DELETE_MARK,
        markId: 4,
        markType: 'symbol'
      });
      expect(result.get('2').toJS().marks).to.deep.equal([]);
    });

  });

  describe('create scene action', function() {

    beforeEach(function() {
      // Reset counters module so that we can have predictable IDs for our new marks
      counter.reset();
    });

    it('registers the scene as a primitive and initializes defaults', function() {
      var result = primitivesReducer(initialState, createScene()).get('1').toJS();
      expect(result).to.exist;
      expect(result).to.have.property('_id');
      expect(result._id).to.equal(1);
      expect(result).to.have.property('name');
      expect(result.name).to.equal('Scene');
      expect(result.type).to.equal('scene');
    });

    it('converts the scene height and width to signal references', function() {
      var result = primitivesReducer(initialState, createScene());
      expect(result.get('1').get('height')).to.deep.equal({
        signal: 'lyra_vis_height'
      });
      expect(result.get('1').get('width')).to.deep.equal({
        signal: 'lyra_vis_width'
      });
    });

  });

  describe('set parent action', function() {
    var setParent;

    beforeEach(function() {
      var addMark = primitiveActions.addMark;
      // Start out with a store already containing two groups and a symbol
      initialState = primitivesReducer(primitivesReducer(primitivesReducer(Immutable.Map(), addMark({
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
      setParent = primitiveActions.setParent;
    });

    it('establishes a parent-child relationship between the provided marks', function() {
      var result = primitivesReducer(initialState, setParent(61, 15)),
          symbol = result.get('61').toJS(),
          group1 = result.get('15').toJS();
      expect(symbol).to.have.property('_parent');
      expect(symbol._parent).to.equal(15);
      expect(group1).to.have.property('marks');
      expect(group1.marks).to.deep.equal([61]);
    });

    it('can move a mark from one group to another', function() {
      // Start with the symbol in group_1
      initialState = primitivesReducer(initialState, setParent(61, 15));
      // Move symbol to group_2
      var result = primitivesReducer(initialState, setParent(61, 22)),
          symbol = result.get('61').toJS(),
          group1 = result.get('15').toJS(),
          group2 = result.get('22').toJS();
      expect(group1.marks).to.deep.equal([]);
      expect(group2.marks).to.deep.equal([61]);
      expect(symbol._parent).to.equal(22);
    });

    it('can remove a mark from its parent', function() {
      // Start with the symbol in group_1
      initialState = primitivesReducer(initialState, setParent(61, 15));
      // Clear symbol's parent
      var result = primitivesReducer(initialState, setParent(61, null)),
          symbol = result.get('61').toJS(),
          group1 = result.get('15').toJS(),
          group2 = result.get('22').toJS();
      expect(group1.marks).to.deep.equal([]);
      expect(group2.marks).to.deep.equal([]);
      expect(symbol._parent).to.equal(null);
    });

  });

  describe('add scale to group action', function() {
    var setParent;

    beforeEach(function() {
      var addMark = primitiveActions.addMark;
      // Start out with a store already containing two groups and a symbol
      initialState = primitivesReducer(Immutable.Map(), addMark({
        _id: 15,
        name: 'group_1',
        type: 'group',
        marks: [],
        scales: []
      }));
    });

    it('has no effect if the provided parent ID is not present in the store', function() {
      var result = primitivesReducer(initialState, {
        type: actions.RULES_ADD_SCALE_TO_GROUP,
        parentId: 51,
        scaleId: 222
      });
      expect(result).to.equal(initialState);
    });

    it('adds the specified scale ID to the specified group\'s scales array', function() {
      var result = primitivesReducer(initialState, {
        type: actions.RULES_ADD_SCALE_TO_GROUP,
        parentId: 15,
        scaleId: 222
      });
      expect(result.get('15').toJS().scales).to.deep.equal([222]);
    });

    it('does not overwrite any preexisting scale IDs in the group\'s scales array', function() {
      initialState = setIn(initialState, '15.scales', [111]);
      expect(initialState.get('15').toJS().scales).to.deep.equal([111]);
      var result = primitivesReducer(initialState, {
        type: actions.RULES_ADD_SCALE_TO_GROUP,
        parentId: 15,
        scaleId: 222
      });
      expect(result.get('15').toJS().scales).to.deep.equal([111, 222]);
    });

  });

  describe('update primitive action', function() {

    it('updates values on the relevant primitive in the store');

  });

  describe('remove primitive action', function() {

    it('removes the primitive from the store');

  });

});
