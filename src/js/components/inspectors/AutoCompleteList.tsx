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
  keyCode: number;
  onSelected: (value: string) => void;
  style: {top: number, left: number, minWidth: number}
}

interface OwnState {
  suggestions: string[];
  selectedValue: string;
}

export class AutoCompleteList extends React.Component<OwnProps, OwnState> {

  constructor(props) {
    super(props);

    this.state = {
      suggestions: [],
      selectedValue: null
    }
  }

  public componentDidUpdate(prevProps: OwnProps) {
    if (prevProps.fields !== this.props.fields || prevProps.signals !== this.props.signals || prevProps.searchPrefix !== this.props.searchPrefix) {
      const suggestions = this.props.searchPrefix !== null ? this.props.fields.concat(this.props.signals).filter(s => s.toLowerCase().startsWith(this.props.searchPrefix.toLowerCase())) : [];
      this.setState({
        suggestions
      })
    }

    if (this.state.selectedValue && !this.state.suggestions.includes(this.state.selectedValue)) {
      this.setSelectedValue(null);
    }

    if (!prevProps.keyCode && this.props.keyCode) {
      if (this.props.keyCode === 38) {
        // up
        this.selectPrev();
      }
      if (this.props.keyCode === 40) {
        // down
        this.selectNext();
      }
      if (this.props.keyCode === 13) {
        // enter
        if (this.state.selectedValue) {
          this.onSelected(this.state.selectedValue);
        }
      }
    }
  }

  private setSelectedValue(value) {
    this.setState({
      selectedValue: value
    })
  }

  private selectPrev() {
    if (!this.state.selectedValue && this.state.suggestions.length) {
      this.setSelectedValue(this.state.suggestions[this.state.suggestions.length - 1]);
    }
    else {
      const index = this.state.suggestions.indexOf(this.state.selectedValue);
      if (index >= 0) {
        this.setSelectedValue(this.state.suggestions[(index - 1 + this.state.suggestions.length) % this.state.suggestions.length]);
      }
    }

  }

  private selectNext() {
    if (!this.state.selectedValue && this.state.suggestions.length) {
      this.setSelectedValue(this.state.suggestions[0]);
    }
    else {
      const index = this.state.suggestions.indexOf(this.state.selectedValue);
      if (index >= 0) {
        this.setSelectedValue(this.state.suggestions[(index + 1) % this.state.suggestions.length]);
      }
    }
  }

  private onSelected(s) {
    this.props.onSelected(s);
    this.setSelectedValue(null);
  }

  public render() {
    return (
      <div className={"autocomplete-list " + (this.state.suggestions.length ? "active" : null)} style={this.props.style}>
        {
          this.state.suggestions.map(s => {
            return <div key={s}
                        className={"autocomplete-suggestion " + (this.state.selectedValue === s ? 'active' : null)}
                        onClick={() => this.onSelected(s)}
                        onMouseEnter={() => this.setSelectedValue(s)}
                        onMouseLeave={() => {
                          if (this.state.selectedValue === s) this.setSelectedValue(null)
                        }}
                        >{s}</div>
          })
        }
      </div>
    );
  }
};
