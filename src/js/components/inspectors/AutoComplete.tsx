'use strict';
const getInVis = require('../../util/immutable-utils').getInVis;

// TODO: derived fields?
const SPAN_OPEN = '<span class="';
const SPAN_FIELD_OPEN  = '<span class="field source" contenteditable="false">';
const SPAN_SIGNAL_OPEN  = '<span class="signal" contenteditable="false">';
const SPAN_CLOSE = '</span>';
const DATUM = 'datum.';
const SIGNALNAME = '#';
const TMPL_OPEN  = '{{';
const TMPL_CLOSE = '}}';
const TMPL_RE = new RegExp(TMPL_OPEN + '.*' + TMPL_CLOSE);
const SPAN_RE = new RegExp('(' + SPAN_FIELD_OPEN + '|' + SPAN_SIGNAL_OPEN + ').*' + SPAN_CLOSE);

import * as React from 'react';
import ContentEditable from 'react-contenteditable';
import * as ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import {AnyAction} from 'redux';
import {ThunkDispatch} from 'redux-thunk';
import {updateMarkProperty} from '../../actions/markActions';
import {PrimType} from '../../constants/primTypes';
import {State} from '../../store';
import {Schema} from '../../store/factory/Dataset';
import {FieldDraggingStateRecord} from '../../store/factory/Inspector';

interface OwnState {
  html: string
}

interface OwnProps {
  type: 'expr' | 'tmpl';
  dsId: number,
  primId: number,
  primType: PrimType,
  value: string,
  updateFn: (evt) => void
}

interface StateProps {
  fields: string[];
  dragging: FieldDraggingStateRecord;
}

interface DispatchProps {
  setDsId: (data: number) => void;
}

function mapStateToProps(reduxState: State, ownProps: OwnProps): StateProps {
  const schema: Schema = getInVis(reduxState, 'datasets.' + ownProps.dsId + '._schema');
  return {
    fields: schema ? schema.keySeq().toJS() : [],
    dragging: reduxState.getIn(['inspector', 'dragging'])
  };
}

function mapDispatchToProps(dispatch: ThunkDispatch<State, null, AnyAction>, ownProps: OwnProps) {
  return {
    setDsId(data: number) {
      dispatch(updateMarkProperty({property: 'from', value: {data}}, ownProps.primId));
    }
  }
}

class BaseAutoComplete extends React.Component<OwnProps & StateProps & DispatchProps, OwnState> {
  constructor(props) {
    super(props);
    this.state = {html: this.toHtml(props.value || '')};
  };

  public componentDidUpdate(prevProps) {
    if (this.props.dsId !== prevProps.dsId) {
      this.props.updateFn(this.fromHtml(this.state.html));

    }
    if (this.props.value !== prevProps.value) {
      this.setState({html: this.toHtml(this.props.value || '')});
    }
  };

  public componentDidMount() {
    const contentEditable = ReactDOM.findDOMNode(this);
    const handleChange = this.handleChange;

    const strategies = [{
      words: this.props.fields,
      match: /\b(\w{2,})$/,
      search: function(term, callback) {
        callback(this.words.map(function(word) {
          return word.toLowerCase().indexOf(term.toLowerCase()) === 0 ? word : null;
        }));
      },
      index: 1,
      replace: function(word) {
        return SPAN_FIELD_OPEN + word + SPAN_CLOSE + ' ';
      }
    }];

    const options = {
      onKeydown: function(e, commands) {
        if (e.keyCode === 32) {
          return commands.KEY_ENTER;
        }
      }
    };

    // $(contentEditable).textcomplete(strategies, options)
    //   .on({'textComplete:select': handleChange});
  };

  public toHtml(str: string) {
    return this.props.type === 'expr' ? this.exprToHtml(str) : this.tmplToHtml(str);
  };

  public fromHtml(str: string) {
    return this.props.type === 'expr' ? this.htmlToExpr(str) : this.htmlToTmpl(str);
  }

  public exprToHtml(str: string) {
    str = str.split(DATUM).join('');
    return this.wrapStr(str, SPAN_FIELD_OPEN, SPAN_CLOSE);
  };

  public htmlToExpr(html) {
    html = html.split(SPAN_FIELD_OPEN).join('');
    html = html.split(SPAN_CLOSE).join('');
    return this.htmlDecode(this.wrapStr(html, DATUM, ''));
  };

  public tmplToHtml(str) {
    const tokens = [];
    let searchStr = str;
    let position = searchStr.search(TMPL_RE);

    while (position !== -1) {
      tokens.push({
        type: 'literal',
        str: searchStr.substring(0, position)
      });

      const next = position + TMPL_OPEN.length;
      const nextStr = searchStr.substring(next);
      const end = nextStr.search(TMPL_CLOSE);
      if (nextStr.startsWith(SIGNALNAME)) {
        tokens.push({
          type: 'signal',
          str: nextStr.substring(SIGNALNAME.length, end)
        });
      }
      else if (nextStr.startsWith(DATUM)) {
        tokens.push({
          type: 'field',
          str: nextStr.substring(DATUM.length, end)
        });
      }

      searchStr = nextStr.substring(end + TMPL_CLOSE.length);
      position = searchStr.search(TMPL_RE);
    }
    tokens.push({
      type: 'literal',
      str: searchStr
    });

    return this.wrapTokensHtml(tokens);
  };

  public htmlToTmpl(html) {
    const tokens = [];
    let searchStr = html;
    let position = searchStr.search(SPAN_RE);

    while (position !== -1) {
      tokens.push({
        type: 'literal',
        str: searchStr.substring(0, position)
      });

      const next = position + SPAN_OPEN.length;
      const nextStr = searchStr.substring(next);
      const end = nextStr.search(SPAN_CLOSE);
      if (nextStr.startsWith('signal')) {
        tokens.push({
          type: 'signal',
          str: nextStr.substring(SPAN_SIGNAL_OPEN.length - SPAN_OPEN.length, end)
        });
      }
      else if (nextStr.startsWith('field')) {
        tokens.push({
          type: 'field',
          str: nextStr.substring(SPAN_FIELD_OPEN.length - SPAN_OPEN.length, end)
        });
      }

      searchStr = nextStr.substring(end + SPAN_CLOSE.length);
      position = searchStr.search(SPAN_RE);
    }
    tokens.push({
      type: 'literal',
      str: searchStr
    });

    return this.htmlDecode(this.wrapTokensTmpl(tokens));
  };

  public wrapTokensHtml(tokens: any[]) {
    return tokens.map(token => {
      if (token.type === 'field') {
        return SPAN_FIELD_OPEN + token.str + SPAN_CLOSE;
      }
      if (token.type === 'signal') {
        return SPAN_SIGNAL_OPEN + token.str + SPAN_CLOSE;
      }
      return token.str;
    }).join('');
  }

  public wrapTokensTmpl(tokens: any[]) {
    return tokens.map(token => {
      if (token.type === 'field') {
        return TMPL_OPEN + DATUM + token.str + TMPL_CLOSE;
      }
      if (token.type === 'signal') {
        return TMPL_OPEN + SIGNALNAME + token.str + TMPL_CLOSE;
      }
      return token.str;
    }).join('');
  }

  public wrapStr(str: string, pre: string, post: string) {
    const fields = this.props.fields;
    const extraLen = pre.length + post.length;

    for (const field of fields) {
      let position = str.search(field);
      let searched = 0

      while (position !== -1) {
        position += searched;
        str = str.substring(0, position) + pre +
          str.substring(position, position + field.length) + post +
          str.substring(position + field.length);
        searched = position + field.length + extraLen;
        const nextStr = str.substring(searched);
        position = nextStr.search(field);
      }
    }

    return str;
  };

  public htmlDecode(input) {
    const e = document.createElement('div');
    e.innerHTML = input;
    return e.childNodes.length === 0 ? '' : e.childNodes[0].nodeValue;
  };

  public handleChange = (evt) => {
    const value = evt.target.value || evt.target.innerHTML || '';
    this.props.updateFn(this.fromHtml(value));
    this.setState({html: value});
  };

  public handleDragOver = (evt) => {
    if (evt.preventDefault) {
      evt.preventDefault(); // Necessary. Allows us to drop.
    }

    return false;
  };

  public handleDrop = (evt)  => {
    const props = this.props;
    const dragging = props.dragging;
    const fieldName = dragging.fieldDef.name;
    const currHtml = this.state.html;
    const html = (currHtml === 'Text' ? '' : currHtml) + SPAN_FIELD_OPEN + fieldName + SPAN_CLOSE;
    if (!props.dsId && dragging.dsId && props.primType === 'marks') {
      props.setDsId(dragging.dsId);
    }
    props.updateFn(this.fromHtml(html));
    this.setState({html});
  };

  public render() {
    return (
      <div onDragOver={this.handleDragOver} onDrop={this.handleDrop}>
        <ContentEditable className='autocomplete' html={this.state.html}
        disabled={false} onChange={this.handleChange} />
      </div>
    );
  }
};
export const AutoComplete = connect(mapStateToProps, mapDispatchToProps)(BaseAutoComplete);
