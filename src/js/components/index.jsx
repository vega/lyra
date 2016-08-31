'use strict';
var React = require('react'),
    ReactDOM = require('react-dom'),
    ReactTooltip = require('react-tooltip'),
    Provider = require('react-redux').Provider,
    Toolbar = require('./Toolbar'),
    InspectorSidebar = require('./InspectorSidebar'),
    EncodingsSidebar = require('./EncodingsSidebar'),
    PipelinesSidebar = require('./PipelinesSidebar'),
    Walkthroughs = require('./Walkthroughs'),
    Footer = require('./Footer'),
    store = require('../store');

// React requires you only have one wrapper element called in your provider
module.exports = window.ui = ReactDOM.render(
  <Provider store={store}>
    <div>
      <Toolbar/>

      <div className="sidebar-container">
        <EncodingsSidebar />
        <InspectorSidebar />
        <PipelinesSidebar />
      </div>

      <Walkthroughs />
      <Footer/>

      <ReactTooltip effect="solid" delayShow={650} class="tooltip" html={true} />
    </div>
  </Provider>,
  document.querySelector('.chrome-container')
);
