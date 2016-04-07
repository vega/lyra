/* eslint no-unused-expressions:0 */
'use strict';

var expect = require('chai').expect;

var Text = require('./Text');
var Mark = require('./Mark');
var VLSingle = require('../../rules/VLSingle');

describe('Text Mark Primitive', function() {
  var text;

  describe('defaultProperties static method', function() {

    it('is a function', function() {
      expect(Text).to.have.property('defaultProperties');
      expect(Text.defaultProperties).to.be.a('function');
    });

    it('returns the expected default properties object', function() {
      var result = Text.defaultProperties();
      expect(result).to.deep.equal({
        type: 'text',
        properties: {
          update: {
            fill: {value: '#4682b4'},
            fillOpacity: {value: 1},
            stroke: {value: '#000000'},
            strokeWidth: {value: 0},
            x: {value: 80},
            y: {value: 30},
            dx: {value: 0, offset: 0},
            dy: {value: 0, offset: 0},
            // Text-specific properties
            text: {value: 'Text'},
            align: {value: 'center'},
            baseline: {value: 'middle'},
            font: {value: 'Helvetica'},
            fontSize: {value: 14},
            fontStyle: {value: 'normal'},
            fontWeight: {value: 'normal'},
            angle: {value: 0}
          }
        }
      });
    });

    it('merged any provided options into the returned properties object', function() {
      var result = Text.defaultProperties({
        _parent: 15
      });
      expect(result).to.have.property('_parent');
      expect(result._parent).to.equal(15);
    });

    it('overwrites default properties with those in the provided props object', function() {
      var result = Text.defaultProperties({
        properties: {
          update: {
            x: {value: 500}
          }
        }
      });
      expect(result.properties).to.deep.equal({
        update: {
          x: {value: 500}
        }
      });
    });

  });

  describe('constructor', function() {

    beforeEach(function() {
      text = new Text();
    });

    it('is a constructor function', function() {
      expect(Text).to.be.a('function');
    });

    it('may be used to create text instances', function() {
      expect(text).to.be.an.instanceOf(Text);
    });

    it('inherits from Mark', function() {
      expect(text).to.be.an.instanceOf(Mark);
    });

    it('initializes instance with a .type property of "text"', function() {
      expect(text).to.have.property('type');
      expect(text.type).to.be.a('string');
      expect(text.type).to.equal('text');
    });

    it('initializes instance with an appropriate .name property', function() {
      expect(text).to.have.property('name');
      expect(text.name).to.be.a('string');
      expect(text.name.startsWith('text_')).to.be.true;
    });

    it('initializes instance with default vega properties', function() {
      expect(text).to.have.property('properties');
      expect(text.properties).to.be.an('object');
      expect(text.properties).to.deep.equal({
        update: {
          fill: {value: '#4682b4'},
          fillOpacity: {value: 1},
          stroke: {value: '#000000'},
          strokeWidth: {value: 0},
          x: {value: 80},
          y: {value: 30},
          dx: {value: 0, offset: 0},
          dy: {value: 0, offset: 0},
          // Text-specific properties
          text: {value: 'Text'},
          align: {value: 'center'},
          baseline: {value: 'middle'},
          font: {value: 'Helvetica'},
          fontSize: {value: 14},
          fontStyle: {value: 'normal'},
          fontWeight: {value: 'normal'},
          angle: {value: 0}
        }
      });
    });

    it('does not initialize instance with a numeric _id by default', function() {
      expect(text).not.to.have.property('_id');
    });

    it('does not initialize instance with a .from property', function() {
      expect(text.from).to.be.undefined;
    });

    it('initializes instance with a ._rule object', function() {
      expect(text).to.have.property('_rule');
      expect(text._rule).to.be.an('object');
      expect(text._rule).to.be.an.instanceOf(VLSingle);
    });

  });

  describe('Constructor with non-default properties', function() {

    beforeEach(function() {
      text = new Text({
        type: 'text',
        _id: 2501,
        name: 'Spartacus',
        properties: {
          update: {
            fill: '#010101'
          }
        }
      });
    });

    it('initializes instance with the name from the provided props object', function() {
      expect(text).to.have.property('name');
      expect(text.name).to.be.a('string');
      expect(text.name).to.equal('Spartacus');
    });

    it('initializes instance with the _id from the provided props object', function() {
      expect(text).to.have.property('_id');
      expect(text._id).to.be.a('number');
      expect(text._id).to.equal(2501);
    });

    it('initializes instance with the .properties from the provided props object', function() {
      expect(text).to.have.property('properties');
      expect(text.properties).to.deep.equal({
        update: {
          fill: '#010101'
        }
      });
    });

    it('still initializes instance with a ._rule object', function() {
      expect(text).to.have.property('_rule');
      expect(text._rule).to.be.an('object');
      expect(text._rule).to.be.an.instanceOf(VLSingle);
    });

  });

  describe('static property options lists', function() {

    it('exposes a static property defining alignment options', function() {
      expect(Text).to.have.property('alignments');
      expect(Text.alignments).to.deep.equal(['left', 'center', 'right']);
    });

    it('exposes a static property defining baseline options', function() {
      expect(Text).to.have.property('baselines');
      expect(Text.baselines).to.deep.equal(['top', 'middle', 'bottom']);
    });

    it('exposes a static property defining font options', function() {
      expect(Text).to.have.property('fonts');
      expect(Text.fonts).to.deep.equal(['Helvetica', 'Verdana', 'Georgia', 'Palatino', 'Garamond', 'Trebuchet MS']);
    });

    it('exposes a static property defining font style options', function() {
      expect(Text).to.have.property('fontStyles');
      expect(Text.fontStyles).to.deep.equal(['normal', 'italic']);
    });

    it('exposes a static property defining font weight options', function() {
      expect(Text).to.have.property('fontWeights');
      expect(Text.fontWeights).to.deep.equal(['normal', 'bold']);
    });

  });

  describe('getHandleStreams static method', function() {
    var getHandleStreams;

    beforeEach(function() {
      getHandleStreams = Text.getHandleStreams;
    });

    it('is a function', function() {
      expect(getHandleStreams).to.be.a('function');
    });

    it('returns a stream signal definitions dictionary object', function() {
      var result = getHandleStreams({
        _id: 2501,
        type: 'text'
      });
      expect(result).to.be.an('object');
    });

    it('keys the stream signal definitions dictionary object by signal name', function() {
      var result = getHandleStreams({
        _id: 2501,
        type: 'text'
      });
      expect(Object.keys(result).sort()).to.deep.equal([
        'lyra_text_2501_fontSize',
        'lyra_text_2501_x',
        'lyra_text_2501_y'
      ]);
    });

    it('sets each value to an array of signal objects', function() {
      var result = getHandleStreams({
        _id: 2501,
        type: 'text'
      });
      Object.keys(result).forEach(function(key) {
        expect(result[key]).to.be.an('array');
        result[key].forEach(function(def) {
          expect(def).to.have.property('type');
          expect(def.type).to.equal('lyra_delta');
          expect(def).to.have.property('expr');
          expect(def.expr).to.be.a('string');
        });
      });
    });

  });

});
