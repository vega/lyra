'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    Modal = require('react-modal'),
    getIn = require('../../util/immutable-utils').getIn,
    WActions = require('../../actions/walkthroughActions'),
    assets = require('../../util/assets'),
    Icon = require('../Icon');


function mapStateToProps(reduxState) {
  return {
    walkthroughs: getIn(reduxState, 'walkthrough.data')
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    select: function(key) {
      dispatch(WActions.setActiveWalkthrough(key));
    }
  };
}

var WalkthroughMenu = React.createClass({
  propTypes: {
    walkthroughs: React.PropTypes.object,
    select: React.PropTypes.func
  },

  getInitialState: function() {
    return {
      modalIsOpen: false
    };
  },

  selectWalkthrough: function(key) {
    this.props.select(key);
    this.closeModal();
  },

  openModal: function() {
    this.setState({modalIsOpen: true});
  },

  closeModal: function() {
    this.setState({modalIsOpen: false});
  },

  getWalkthroughDetails: function() {
    var walkD = this.props.walkthroughs.toJS();
    var walkthroughs = [];
    for (var key in walkD) {
      walkD[key].key = key;
      walkthroughs.push(walkD[key]);
    }
    return walkthroughs;
  },

  classNames: 'hints walkthroughMenu ',

  render: function() {
    return (
      <div>
        <a onClick={this.openModal}>Walkthroughs</a>
        <Modal
          isOpen={this.state.modalIsOpen}
          onRequestClose={this.closeModal}>
            <div className ="wrapper walkthrough-menu">
              <span className="closeModal" onClick={this.closeModal}>
                <Icon glyph={assets.close} />
              </span>
              <h2 className="hed">Select a walkthrough</h2>
              <p>
                Learn to use lyra with step by step guides.
                You can quit them at any time to explore on your own.
              </p>
              <ul>
                {this.getWalkthroughDetails().map(function(wk, i) {
                  var thumbnail = wk.image ? (<img src={wk.image}/>) : null;
                  return (
                    <li key={i} onClick={this.selectWalkthrough.bind(this, wk.key)}>
                      {thumbnail}
                      <span>{wk.title}</span>
                    </li>
                  );
                }, this)}
              </ul>
            </div>
          </Modal>
      </div>
    );
  }
});

module.exports = connect(mapStateToProps, mapDispatchToProps)(WalkthroughMenu);
