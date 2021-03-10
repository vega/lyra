import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import ReactTooltip from 'react-tooltip'
import {store} from '../store';
import {EncodingsSidebar} from './EncodingsSidebar';
import {InspectorSidebar} from './InspectorSidebar';
import {PipelinesToolbar} from './PipelinesSidebar';
import {Toolbar} from './Toolbar';
import WidgetDropzone from './interactions/WidgetDropzone';
import MarkDropzone from './toolbar/MarkDropzone';

// React requires you only have one wrapper element called in your provider
module.exports = ReactDOM.render(
  <Provider store={store}>
    <div className='lyra-container'>
      <div className='sidebar-container'>
        <EncodingsSidebar />
        <InspectorSidebar />
      </div>

      <div className='main-container'>
        <PipelinesToolbar />
        <div className='tools-container'>
          <div className="vis-container">
            <div id="vis"></div>
            <WidgetDropzone />
            <MarkDropzone />
          </div>
          <Toolbar />
        </div>
      </div>

      <ReactTooltip
        effect='solid'
        delayShow={375}
        class='tooltip'
        html={true}
      />
    </div>
  </Provider>,
  document.querySelector('.app-container')
);
