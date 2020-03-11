import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import ReactTooltip from 'react-tooltip'
import {store} from '../store';
import {EncodingsSidebar} from './EncodingsSidebar';
import {InspectorSidebar} from './InspectorSidebar';
import InteractionPreviewContainer from './interactions/InteractionPreviewContainer';
import {PipelinesToolbar} from './PipelinesSidebar';
import {Toolbar} from './Toolbar';

// React requires you only have one wrapper element called in your provider
module.exports = ReactDOM.render(
  <Provider store={store}>
    <div className='lyra-container'>
      <div className='sidebar-container'>
        <EncodingsSidebar />
        <InspectorSidebar />
      </div>

      <div className='main-container'>
        <div className='topbar-container'>
          <PipelinesToolbar />
          <Toolbar />
        </div>
        <div className="vis-container">
          <div id="vis"></div>
          <div className="interaction-preview-container"></div>
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

// TODO(jzong): uncomment this and move it to inspector
// ReactDOM.render(
//   <Provider store={store}>
//     <InteractionPreviewContainer></InteractionPreviewContainer>
//   </Provider>,
//   document.querySelector('.interaction-preview-container')
// );
