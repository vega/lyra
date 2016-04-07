'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    Modal = require('react-modal'),
    WActions = require('../../actions/walkthrough');


function mapStateToProps(reduxState, ownProps) {
  var walkD = require('../../walkthrough');
  return {
    walkthroughs: function(){
      var walkthroughs = [];
      for (var key in walkD){
        walkD[key].key = key;
        walkthroughs.push(walkD[key]);
      }
      return walkthroughs;
    }
  };
}
function mapDispatchToProps(dispatch, ownProps) {
  return {
    select: function(key) {
      dispatch(WActions.setActiveWalkthrough(key));
      dispatch(WActions.setWalkthroughOn(true));
      this.closeModal();
    }
  };
}

var WalkthroughMenu = React.createClass({
  getInitialState: function() {
    return {
      modalIsOpen: false
    };
  },
  openModal: function() {
    this.setState({modalIsOpen: true});
  },

  closeModal: function() {
    this.setState({modalIsOpen: false});
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
              <span className="closeModal" onClick={this.closeModal}>close</span>
              <h2 className="hed">Select a walkthrough</h2>
              <p>
                Learn to use lyra with step by step guides.
                You can quit them at any time to explore on your own.
              </p>
              <ul>
                {this.props.walkthroughs().map(function(wk, i) {
                  var thumbnail = wk.image ? (<img src={wk.image}/>):null;
                  return (
                    <li key={i} onClick={this.props.select.bind(this, wk.key)}>
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
