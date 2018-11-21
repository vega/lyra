'use strict';
var React = require('react'),
    Modal = require('react-modal'),
    Settings = require('./settings/SettingsModal'),
    Walkthroughs = require('./walkthrough/Menu'),
    createReactClass = require('create-react-class');


var Footer = createReactClass({
  getInitialState: function() {
    return {modalIsOpen: false};
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
          <li><a href="https://github.com/vega/lyra">Github</a></li>
          <li>
            <Walkthroughs/>
          </li>
          <li>
            <Settings/>
          </li>
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
});

module.exports = Footer;
