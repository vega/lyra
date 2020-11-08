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
import {AutoCompleteList} from './AutoCompleteList';

interface OwnProps {
  type: 'expr' | 'tmpl';
  dsId: number,
  primId: number,
  primType: PrimType,
  value: string,
  updateFn: (evt) => void
}

interface OwnState {
  searchPrefix: string;
  keyCode: number;
}

interface StateProps {
  fields: string[];
  signals: string[];
  dragging: DraggingStateRecord;
}

interface DispatchProps {
  setDsId: (data: number) => void;
  setSignalPush: (signalName: string, push: boolean, id: number) => void;
}

function mapStateToProps(reduxState: State, ownProps: OwnProps): StateProps {
  const schema: Schema = getInVis(reduxState, 'datasets.' + ownProps.dsId + '._schema');
  const interactions: InteractionRecord[] = reduxState.getIn(['vis', 'present', 'interactions']).valueSeq().toArray();
  const interactionSignals = [].concat.apply([], interactions.filter(interaction => interaction.signals.length).map(interaction => interaction.signals.map(signal => signal.signal)));
  const widgets: WidgetRecord[] = reduxState.getIn(['vis', 'present', 'widgets']).valueSeq().toArray();
  const widgetSignals = [].concat.apply([], widgets.filter(widget => widget.signals.length).map(widget => widget.signals.map(signal => signal.signal)));
  return {
    fields: schema ? schema.keySeq().toJS() : [],
    signals: interactionSignals.concat(widgetSignals),
    dragging: reduxState.getIn(['inspector', 'dragging'])
  };
}

function mapDispatchToProps(dispatch: ThunkDispatch<State, null, AnyAction>, ownProps: OwnProps) {
  return {
    setDsId(data: number) {
      dispatch(updateMarkProperty({property: 'from', value: {data}}, ownProps.primId));
    },
    setSignalPush(signalName, push, id) {
      dispatch(setSignalPush({[signalName]: push}, id));
    }
  }
}

class BaseAutoComplete extends React.Component<OwnProps & StateProps & DispatchProps, OwnState> {

  constructor(props) {
    super(props);

    this.state = {
      searchPrefix: null,
      keyCode: null
    }
  }

  private ref;

  private getSelectedRangeWithinEl() {
    const el = this.ref?.htmlEl;
    var selectedRange = null;
    var sel = rangy.getSelection();
    var elRange = rangy.createRange();
    elRange.selectNodeContents(el);
    if (sel.rangeCount) {
        selectedRange = sel.getRangeAt(0).intersection(elRange);
    }
    elRange.detach();
    if (!selectedRange) {
      //set the caret after the node for this range
      if (el.childNodes?.length) {
        const lastChild = el.childNodes[el.childNodes.length - 1];
        elRange.setStartAfter(lastChild);
        elRange.setEndAfter(lastChild);
      }
      else {
        elRange.selectNodeContents(el);
      }

      //apply this range to the selection object
      sel.removeAllRanges();
      sel.addRange(elRange);
      return elRange;
    }
    return selectedRange;
  }

  private createElementFromHTML(htmlString) {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    return div.firstChild;
  }

  private insertNodeAtCaret = (window as any).insertNodeAtCaret = (html) => {
    const node = this.createElementFromHTML(html);
    const sel = rangy.getSelection();
    const range = this.getSelectedRangeWithinEl();
    if (range) {
      range.collapse(false);
      range.insertNode(node);
      range.collapseAfter(node);
      sel.setSingleRange(range);
    }
  }

  private replaceMaintainingCaret = (search, replace) => {
    if (this.ref) {
      const sel = rangy.getSelection();

      [...this.ref.htmlEl.childNodes].forEach(node => {
        if (node.nodeValue) {
          const startIndex = node.nodeValue.indexOf(search);
          const endIndex = startIndex + search.length;

          if (startIndex === -1) {
            return;
          }

          const range = document.createRange();
          //Set the range to contain search text
          range.setStart(node, startIndex);
          range.setEnd(node, endIndex);
          //Delete search text
          range.deleteContents();
          //Insert replace text
          this.insertNodeAtCaret(replace);
        }
      })
    }
  }

  private getHeadToCaret = (window as any).getHeadToCaret = () => {
    if (this.ref) {
      const sel = rangy.getSelection();
      const selRange = this.getSelectedRangeWithinEl();
      const newRange = document.createRange();
      newRange.selectNodeContents(this.ref.htmlEl);
      newRange.setEnd(selRange.startContainer, selRange.startOffset);
      const fragment = newRange.cloneContents();
      const temp = document.createElement("body");
      temp.appendChild(fragment);
      const html = temp.innerHTML;
      return html;
    }
  }

  public toHtml(expr) {
    if (this.props.type === 'expr') return this.exprToHtml(expr);
    if (this.props.type === 'tmpl') return this.tmplToHtml(expr);
  }

  public fromHtml(html) {
    if (this.props.type === 'expr') return this.htmlToExpr(html);
    if (this.props.type === 'tmpl') return this.htmlToTmpl(html);
  }

  private decodeHtml(html) {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  }

  public htmlToTmpl(html) {
    const tokens = [];
    let searchStr = html;
    let position = searchStr.search(SPAN_RE);

    while (position !== -1) {
      tokens.push({
        type: 'literal',
        str: searchStr.substring(0, position)
      });

      const next = position + SPAN_PREFIX.length;
      const nextStr = searchStr.substring(next);
      const end = nextStr.search(SPAN_CLOSE);
      if (nextStr.startsWith('signal')) {
        tokens.push({
          type: 'signal',
          str: nextStr.substring(SPAN_SIGNAL_OPEN.length - SPAN_PREFIX.length, end)
        });
      }
      else if (nextStr.startsWith('field')) {
        tokens.push({
          type: 'field',
          str: nextStr.substring(SPAN_FIELD_OPEN.length - SPAN_PREFIX.length, end)
        });
      }

      searchStr = nextStr.substring(end + SPAN_CLOSE.length);
      position = searchStr.search(SPAN_RE);
    }
    tokens.push({
      type: 'literal',
      str: searchStr
    });

    return tokens.map(token => {
      switch (token.type) {
        case 'literal':
          return JSON.stringify(this.decodeHtml(token.str.replace(/(<([^>]+)>)/gi, "")));
        case 'signal':
          return token.str;
        case 'field':
          return DATUM + token.str;
      };
    }).join(' + ');
  }

  public tmplToHtml(tmpl: string) {
    const unjoin = tmpl.split(' + ')
    return unjoin.map(str => {
      if (str.startsWith('"') && str.endsWith('"')) {
        return JSON.parse(str);
      }
      else if (str.startsWith(DATUM)) {
        return SPAN_FIELD_OPEN + str.substring(DATUM.length) + SPAN_CLOSE;
      }
      return SPAN_SIGNAL_OPEN + str + SPAN_CLOSE;
    }).join('');
  }

  public exprToHtml(str: string) {
    const fields = this.props.fields;
    const signals = this.props.signals;

    const fieldRe = new RegExp(fields.map(s => DATUM + s).join('|'), 'g');
    const signalRe = new RegExp(signals.join('|'), 'g');

    str = str.replace(fieldRe, (match) => {
      if (match) {
        return SPAN_FIELD_OPEN + match.substring(DATUM.length) + SPAN_CLOSE
      }
      return match;
    });
    str = str.replace(signalRe, (match) => {
      if (match) {
        return SPAN_SIGNAL_OPEN + match + SPAN_CLOSE
      }
      return match;
    });

    return str;
  };

  private htmlToExpr = (html: string) => {
    this.props.fields.forEach(fieldName => {
      const fieldTag = SPAN_FIELD_OPEN + fieldName + SPAN_CLOSE;
      html = html.replace(fieldTag, DATUM + fieldName);
    });
    const tagsStripped = html.replace(/(<([^>]+)>)/gi, "");
    return this.decodeHtml(tagsStripped);
  }

  private debounceUpdate = debounce(500, () => {
    if (this.ref) {
      this.props.updateFn(this.fromHtml(this.ref.htmlEl.innerHTML));
    }
  })

  private processTokens = (value) => {
    this.props.fields.forEach(field => {
      if (value.includes(`:${field}:`)) {
        this.replaceMaintainingCaret(`:${field}:`, SPAN_FIELD_OPEN + field + SPAN_CLOSE);
      }
    });

    this.props.signals.forEach(signal => {
      if (value.includes(`:${signal}:`)) {
        this.replaceMaintainingCaret(`:${signal}:`, SPAN_SIGNAL_OPEN + signal + SPAN_CLOSE);
      }
    });
  }

  public handleChange = (evt) => {
    let value = evt.target.value || evt.target.innerHTML || '';

    this.processTokens(value);

    const sub = this.getHeadToCaret();
    if (sub.match(/:\w*$/g)) {
      const searchPrefix = sub.substring(sub.lastIndexOf(':') + 1);
      this.setState({searchPrefix});
    }
    else {
      this.setState({searchPrefix: null});
    }

    this.debounceUpdate();
  };

  public handleDragOver = (evt) => {
    if (evt.preventDefault) {
      evt.preventDefault(); // Necessary. Allows us to drop.
    }

    return false;
  };

  public handleDrop = (evt)  => {
    const props = this.props;
    let dragging = props.dragging;
    if ((dragging as FieldDraggingStateRecord).dsId) {
      dragging = dragging as FieldDraggingStateRecord;
      const fieldName = dragging.fieldDef.name;
      this.insertNodeAtCaret(SPAN_FIELD_OPEN + fieldName + SPAN_CLOSE);
      if (!props.dsId && dragging.dsId && props.primType === 'marks') {
        props.setDsId(dragging.dsId);
      }
    }
    else if ((dragging as SignalDraggingStateRecord).signal) {
      dragging = dragging as SignalDraggingStateRecord;
      if (dragging.interactionId) {
        this.props.setSignalPush(dragging.signal, true, dragging.interactionId);
      }
      const signalName = dragging.signal;
      this.insertNodeAtCaret(SPAN_SIGNAL_OPEN + signalName + SPAN_CLOSE);
    }
    this.debounceUpdate();
  };

  public onAutoCompleteSelect = (value) => {
    this.replaceMaintainingCaret(":" + this.state.searchPrefix, ":" + value + ":");
    if (this.ref) {
      this.processTokens(this.ref.htmlEl.innerHTML)
    }
    this.setState({searchPrefix: null});
    this.debounceUpdate();
  }

  private onKeyDown = (e) => {
    if (this.state.searchPrefix !== null) {
      if (e.keyCode === 38 || e.keyCode === 40) {
        e.preventDefault(); // capture up and down keys when the autocompletelist is open
        this.setState({keyCode: e.keyCode});
      }
      if (e.keyCode === 13) {
        this.setState({keyCode: e.keyCode});
      }
    }
  }

  private onKeyUp = (e) => {
    this.setState({keyCode: null});
  }

  private getDropdownPosition() {
    if (this.ref) {
      const bounds = this.ref.htmlEl.getBoundingClientRect();
      return {
        top: bounds.bottom,
        left: bounds.left,
        width: bounds.width - 2,
      }
    }
    return null;
  }

  public render() {
    return (
      <div className="autocomplete-wrap" onDragOver={this.handleDragOver} onDrop={this.handleDrop} onKeyDown={this.onKeyDown} onKeyUp={this.onKeyUp}>
        <ContentEditable ref={(ref) => {this.ref = ref}} className='autocomplete' html={this.toHtml(this.props.value || '')}
        disabled={false} onChange={this.handleChange} onKeyDown={(e) => {if (e.key === 'Enter' || e.keyCode === 13) e.preventDefault()}} />
        <AutoCompleteList style={this.getDropdownPosition()} fields={this.props.fields} signals={this.props.signals} searchPrefix={this.state.searchPrefix} keyCode={this.state.keyCode} onSelected={this.onAutoCompleteSelect}></AutoCompleteList>
      </div>
    );
  }
};
export const AutoComplete = connect(mapStateToProps, mapDispatchToProps)(BaseAutoComplete);
