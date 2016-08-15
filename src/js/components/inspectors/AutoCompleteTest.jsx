var React = require('react'),
    expect = require('chai').expect,
    dl = require('datalib'),
    configureMockStore = require('redux-mock-store'),
    Immutable = require('immutable'),
    enzyme = require('enzyme'),
    mount = enzyme.mount,
    Property = require('./Property'),
    resetMarkVisual = require('../../actions/markActions').resetMarkVisual,
    wrapper;

describe('AutoComplete <AutoComplete/>', function() {
	var mockStore = configureMockStore([]);


	it.only('renders as a <span>', function() {
		wrapper = mount(<AutoComplete path="hello.yiyang" type="expr" value = 'x > 6'/>, {
			context: {store: mockStore(Immutable.Map({
				hello: {
					yiyang: "datum.x > 5"
				}
			}
				)
				)

			}
		}
			);
    	expect(wrapper.type()).to.eql('div');
  	});

	
	

	expect(wrapper.find('span')).to.have.text('x');
	expect(wrapper.prop('type')).to.equal('expr');
	expect(wrapper.prop('path')).to.equal('hello.yiyang');
	expect(wrapper.prop('value')).to.equal('x > 5');
});