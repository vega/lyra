'use strict';
const getInVis = require('../../util/immutable-utils').getInVis;

// TODO: derived fields?
const SPAN_FIELD_OPEN  = '<span class="field source" contenteditable="false">';
const SPAN_SIGNAL_OPEN  = '<span class="signal" contenteditable="false">';
const SPAN_CLOSE = '</span>';
const DATUM = 'datum.';
const SPAN_PREFIX = '<span class="';
const SPAN_RE = new RegExp('(' + SPAN_FIELD_OPEN + '|' + SPAN_SIGNAL_OPEN + ').*' + SPAN_CLOSE);

import * as React from 'react';
import * as rangy from 'rangy';
import ContentEditable from 'react-contenteditable';
import { connect } from 'react-redux';
import {AnyAction} from 'redux';
import {ThunkDispatch} from 'redux-thunk';
import {updateMarkProperty} from '../../actions/markActions';
import {setSignalPush} from '../../actions/interactionActions';
import {PrimType} from '../../constants/primTypes';
import {State} from '../../store';
import {Schema} from '../../store/factory/Dataset';
import {FieldDraggingStateRecord, DraggingStateRecord, SignalDraggingStateRecord} from '../../store/factory/Inspector';
import {InteractionRecord} from '../../store/factory/Interaction';
import {WidgetRecord} from '../../store/factory/Widget';
import {debounce} from 'throttle-debounce';

interface OwnProps {
  fields: string[];
  signals: string[];
  searchPrefix: string;
  onSelected: (value: string) => void;
}

export class AutoCompleteList extends React.Component<OwnProps> {
  public render() {
    const suggestions = this.props.searchPrefix !== null ? this.props.fields.concat(this.props.signals).filter(s => s.toLowerCase().startsWith(this.props.searchPrefix.toLowerCase())) : [];

    return (
      <div className="autocomplete-list">
        {
          suggestions.map(s => <div key={s} className="autocomplete-suggestion" onClick={() => this.props.onSelected(s)}>{s}</div>)
        }
      </div>
    );
  }
};
