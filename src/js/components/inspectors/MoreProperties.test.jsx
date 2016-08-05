/* eslint no-unused-expressions:0,new-cap:0 */
'use strict';

var React = require('react'),
    expect = require('chai').expect,
    enzyme = require('enzyme'),
    shallow = enzyme.shallow,
    MoreProperties = require('./MoreProperties'),
    wrapper;

describe('MoreProperties Component <MoreProperties/>', function() {
  describe('Default state', function() {
    beforeEach(function() {
      wrapper = shallow(<MoreProperties />);
    });

    it('is hidden', function() {
      expect(wrapper.state('display')).to.equal('none');
    });

    it('shows the moreLink', function() {
      expect(wrapper.find('.show-more-props').prop('style'))
        .to.have.property('display', 'block');
    });

    it('hides the fewerLink', function() {
      expect(wrapper.find('.hide-more-props').prop('style'))
        .to.have.property('display', 'none');
    });

    it('hides the content', function() {
      expect(wrapper.find('.more-props').prop('style'))
        .to.have.property('display', 'none');
    });
  });

  describe('Click moreLink', function() {
    beforeEach(function() {
      wrapper = shallow(<MoreProperties />);
      wrapper.find('.show-more-props').simulate('click');
    });

    it('toggles the state', function() {
      expect(wrapper.state('display')).to.equal('block');
    });

    it('hides the moreLink', function() {
      expect(wrapper.find('.show-more-props').prop('style'))
        .to.have.property('display', 'none');
    });

    it('shows the fewerLink', function() {
      expect(wrapper.find('.hide-more-props').prop('style'))
        .to.have.property('display', 'block');
    });

    it('shows the content', function() {
      expect(wrapper.find('.more-props').prop('style'))
        .to.have.property('display', 'block');
    });
  });

  describe('Click hideLink', function() {
    beforeEach(function() {
      wrapper = shallow(<MoreProperties />);
      wrapper.find('.show-more-props').simulate('click');
      wrapper.find('.hide-more-props').simulate('click');
    });

    it('toggles the state', function() {
      expect(wrapper.state('display')).to.equal('none');
    });

    it('shows the moreLink', function() {
      expect(wrapper.find('.show-more-props').prop('style'))
        .to.have.property('display', 'block');
    });

    it('hides the fewerLink', function() {
      expect(wrapper.find('.hide-more-props').prop('style'))
        .to.have.property('display', 'none');
    });

    it('hides the content', function() {
      expect(wrapper.find('.more-props').prop('style'))
        .to.have.property('display', 'none');
    });
  });

  it('renders children', function() {
    wrapper = shallow(
      <MoreProperties>
        <div className="content">Hello World</div>
      </MoreProperties>
    );

    expect(wrapper.find('.more-props').find('div.content')).to.have.length(1);
  });

  describe('Toggle link', function() {
    it('renders an anchor link by default', function() {
      wrapper = shallow(<MoreProperties label="Axis" />);

      var moreLink = wrapper.find('.show-more-props'),
          hideLink = wrapper.find('.hide-more-props');
      expect(moreLink.is('a')).to.be.true;
      expect(moreLink.text()).to.equal('+ More Axis Properties');
      expect(hideLink.is('a')).to.be.true;
      expect(hideLink.text()).to.equal('– Fewer Axis Properties');
    });

    it('renders a header link', function() {
      wrapper = shallow(<MoreProperties label="Ticks" header={true} />);

      var moreLink = wrapper.find('.show-more-props'),
          hideLink = wrapper.find('.hide-more-props');
      expect(moreLink.is('h3')).to.be.true;
      expect(moreLink.text()).to.equal('+ Ticks');
      expect(hideLink.is('h3')).to.be.true;
      expect(hideLink.text()).to.equal('— Ticks');
    });
  });

});
