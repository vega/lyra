'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    Modal = require('react-modal');


var Footer = connect()(React.createClass({
  getInitialState: function() {
    return { modalIsOpen: false };
  },

  openModal: function() {
    this.setState({modalIsOpen: true});
  },

  closeModal: function() {
    this.setState({modalIsOpen: false});
  },
  classNames: 'site-footer',
  render: function() {
    return (
      <footer className={this.classNames}>
        <ul>
          <li onClick={this.openModal}>About</li>
          <li>Github</li>
          <li>Walkthroughs</li>
          <li>Settings</li>
        </ul>
        <Modal
          isOpen={this.state.modalIsOpen}
          onRequestClose={this.closeModal}>
          <div className ="wrapper">
            <span className="closeModal" onClick={this.closeModal}>close</span>
            <h2>About the team... </h2>

            <div>I am a modal</div>
          </div>
        </Modal>
      </footer>
    );
  }
}));

module.exports = Footer;
