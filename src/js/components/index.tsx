import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import ReactTooltip from 'react-tooltip'
import {store} from '../store';
import {EncodingsSidebar} from './EncodingsSidebar';
import {InspectorSidebar} from './InspectorSidebar';
import InteractionPreviewContainer from './interactions/InteractionPreviewContainer';
import {PipelinesSidebar} from './PipelinesSidebar';
import {Toolbar} from './Toolbar';

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

      <ReactTooltip
        effect='solid'
        delayShow={375}
        class='tooltip'
        html={true}
      />
    </div>
  </Provider>,
  document.querySelector('.chrome-container')
);

// TODO: not hardcode the group name
ReactDOM.render(
  <Provider store={store}>
    <InteractionPreviewContainer></InteractionPreviewContainer>
  </Provider>,
  document.querySelector('.interaction-preview-container')
);
