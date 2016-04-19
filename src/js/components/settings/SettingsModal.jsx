'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    Modal = require('react-modal'),
    getIn = require('../../util/immutable-utils').getIn,
    HintsOn = require('../../actions/hintActions').on;


function mapStateToProps(reduxState) {
  return {
    selected: getIn(reduxState, 'hints.on')
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    select: function(){
      dispatch(HintsOn(!this.props.selected));
    }
  };
}

var Settings = React.createClass({
  propTypes: {
  },

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

  render: function() {
    return (
      <div>
        <a onClick={this.openModal}>Settings</a>
        <Modal
          isOpen={this.state.modalIsOpen}
          onRequestClose={this.closeModal}>
            <div className ="wrapper settings">
              <span className="closeModal" onClick={this.closeModal}>close</span>
              <h2 className="hed">Settings</h2>
                <label className="label-inline">Hints: </label>
                <div className="onoffswitch inline">
                  <input type="checkbox" name="onoffswitch" className="onoffswitch-checkbox" id="myonoffswitch" defaultChecked={this.props.selected} onChange={this.props.select.bind(this,'')}/>
                  <label className="onoffswitch-label" htmlFor="myonoffswitch">
                    <span className="onoffswitch-inner"></span>
                    <span className="onoffswitch-switch"></span>
                  </label>
                </div>
            </div>
          </Modal>
      </div>
    );
  }
});

module.exports = connect(mapStateToProps, mapDispatchToProps)(Settings);
