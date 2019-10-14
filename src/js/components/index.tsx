import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import * as ReactTooltip from 'react-tooltip';
import {store} from '../store';
import {EncodingsSidebar} from './EncodingsSidebar';
import {Footer} from './Footer';
import {InspectorSidebar} from './InspectorSidebar';
import {PipelinesSidebar} from './PipelinesSidebar';
import {Toolbar} from './Toolbar';
import InteractionPreviewContainer from './interactions/InteractionPreviewContainer';

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

// TODO: not hardcode the group name
ReactDOM.render(
  <Provider store={store}>
    <InteractionPreviewContainer></InteractionPreviewContainer>
  </Provider>,
  document.querySelector('.interaction-preview-container')
);
