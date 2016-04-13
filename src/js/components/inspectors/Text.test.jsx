/* eslint no-unused-expressions:0 */
'use strict';

var expect = require('chai').expect;
var React = require('react');
var enzyme = require('enzyme');
var Text = require('./Text');
var Property = require('./Property');
var wrapper;

// this is shallow rendered tested since all the work is done in property.js
describe('Text Inspector <Text/> (shallow)', function() {
  beforeEach(function() {
    var mock = {
      properties: {
        update: {
          align: {value: 'center'},
          angle: {value: 0},
          baseline: {value: 'middle'},
          fill: {value: '#4682b4'},
          fillOpacity: {value: 1},
          font: {value: 'Helvetica'},
          fontSize: {value: 14},
          fontStyle: {value: 'normal'},
          fontWeight: {value: 'normal'},
          strokeWidth: {value: 0},
          text: {value: 'Text'},
          dx: {value: 0, offset: 0},
          dy: {value: 0, offset: 0},
          x: {value: 80},
          y: {value: 30}
        }
      }
    };
    wrapper = enzyme.shallow(<Text primitive={mock}/>);
  });

  it('renders as a <div>', function() {
    expect(wrapper.type()).to.equal('div');
  });

  it('should render 14 Property components', function() {
    expect(wrapper.find(Property)).to.have.length(14);
  });

  it('should render Property components for each inspectable property', function() {
    [
      'align',
      'angle',
      'baseline',
      'dx',
      'dy',
      'fill',
      'fillOpacity',
      'font',
      'fontSize',
      'fontStyle',
      'fontWeight',
      'text',
      'x',
      'y'
    ].forEach(function(prop) {
      // @TODO: "name" is not the right property to inspect, but unless we
      // refactor <Property> to take a single field prop, the name's the only
      // attribute of the nested components that we can inspect.
      expect(wrapper.find('[name="' + prop + '"]')).to.have.length(1);
    });
  });

  it('it should render headers for each group', function() {
    expect(wrapper.find('h4')).to.have.length(5);
  });
});
