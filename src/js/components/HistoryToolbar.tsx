import * as React from 'react';
import {HistoryList} from './history/HistoryList';

export class HistoryToolbar extends React.PureComponent<{}, {modalIsOpen: boolean}> {
  constructor(props) {
    super(props);
  }

  public render() {
    return (
      <div id='history-toolbar'>
        <h2>History</h2>
        <HistoryList />
      </div>
    );
  }
}
