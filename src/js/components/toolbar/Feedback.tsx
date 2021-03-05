import * as React from 'react';
import * as vg from 'vega';
import {exporter} from '../../ctrl/export';
import {download, toBlob} from '../../util/io';
import {Icon} from '../Icon';

const assets = require('../../util/assets');

export class Feedback extends React.Component {


  public render() {
    return (
      <ul className="feedback">
        <a href="https://github.com/vega/lyra/issues/new" target="_blank">
          <li>
            <Icon glyph={assets.exclamation} width='18' /> Feedback
          </li>
        </a>
      </ul>
    );
  }
}
