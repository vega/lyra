import * as React from 'react';
import {connect} from 'react-redux';
import {hydrate, persist} from '../../ctrl/persist';
import {download, fopen, toBlob} from '../../util/io';
import {Icon} from '../Icon';

const assets = require('../../util/assets');

interface PersistProps {
  hydrate: (str: string) => void
}

class BasePersist extends React.Component<PersistProps> {
  constructor(props) {
    super(props);
    this.open = this.open.bind(this);
  }
  public open() {
    return fopen('json', this.props.hydrate);
  }

  public save() {
    const state = persist();
    return toBlob(JSON.stringify(state), 'json');
  }

  public render() {
    return (
      <ul class='persist'>
        <li onClick={this.open}><Icon glyph={assets.open} className='open' width='15' /></li>
        <li onClick={this.save}><Icon glyph={assets.save} className='save' /></li>
      </ul>
    )
  }
}

export const Persist = connect(null, {hydrate})(BasePersist);
