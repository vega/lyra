import * as React from 'react';
import GroupList from './encodings/GroupList';
import ScaleList from './encodings/ScaleList';
import InteractionList from './encodings/InteractionList';

export class EncodingsSidebar extends React.Component {
  private groupList = React.createRef();
  private scaleList = React.createRef();
  private interactionList = React.createRef();

  public render() {
    return (
      <div className='sidebar' id='visual-sidebar'>
        <GroupList ref={(ref: any) => this.groupList = ref} />
        <ScaleList ref={(ref: any) => this.scaleList = ref}/>
        <InteractionList ref={(ref: any) => this.interactionList = ref}/>
      </div>
    );
  }
}
