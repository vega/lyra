/* eslint no-unused-expressions:0 */
'use strict';

var expect = require('chai').expect;

var Text = require('./Text');
var Mark = require('./Mark');

describe('Text Mark', function() {
  var text;

  beforeEach(function() {
    text = new Text();
  });

  describe('constructor', function() {

    it('is a constructor function', function() {
      expect(Text).to.be.a('function');
    });

    it('may be used to create text instances', function() {
      expect(text).to.be.an.instanceOf(Text);
    });

    it('inherits from Mark', function() {
      expect(text).to.be.an.instanceOf(Mark);
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

});
