import * as React from 'react';
import GroupList from './encodings/GroupList';
import ScaleList from './encodings/ScaleList';

export class EncodingsSidebar extends React.Component {
  private groupList = React.createRef();
  private scaleList = React.createRef();

  public render() {
    return (
      <div className='sidebar' id='visual-sidebar'>
        <GroupList ref={(ref: any) => this.groupList = ref} />
        <ScaleList ref={(ref: any) => this.scaleList = ref}/>
      </div>
    );
  }
}
