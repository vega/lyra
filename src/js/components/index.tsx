'use strict';
const ReactDOM = require('react-dom'),
  ReactTooltip = require('react-tooltip'),
  Provider = require('react-redux').Provider,
  InspectorSidebar = require('./InspectorSidebar'),
  EncodingsSidebar = require('./EncodingsSidebar'),
  PipelinesSidebar = require('./PipelinesSidebar'),
  Footer = require('./Footer'),
  store = require('../store');

import * as React from 'react';
import { Toolbar } from './Toolbar';

// React requires you only have one wrapper element called in your provider
module.exports = (window as any).ui = ReactDOM.render(
  <Provider store={store}>
    <div>
      <Toolbar />

      <div className='sidebar-container'>
        <EncodingsSidebar />
        <InspectorSidebar />
        <PipelinesSidebar />
      </div>

      <Footer />

      <ReactTooltip
        effect='solid'
        delayShow={650}
        class='tooltip'
        html={true}
      />
    </div>
  </Provider>,
  document.querySelector('.chrome-container')
);
