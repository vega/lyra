'use strict';
const getInVis = require('../../util/immutable-utils').getInVis;

// TODO: derived fields?
const SPAN_OPEN  = '<span class="field source" contenteditable="false">';
const SPAN_CLOSE = '</span>';
const DATUM = 'datum.';
const TMPL_OPEN  = '{{';
const TMPL_CLOSE = '}}';
const TMPL_DATUM = new RegExp(TMPL_OPEN + DATUM + '*' + TMPL_CLOSE);

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
import {DraggingStateRecord} from '../../store/factory/Inspector';

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
  dragging: DraggingStateRecord;
}

interface DispatchProps {
  setDsId: (data: number) => void;
}

function mapStateToProps(reduxState: State, ownProps: OwnProps): StateProps {
  const schema: Schema = getInVis(reduxState, 'datasets.' + ownProps.dsId + '._schema');
  return {
    fields: schema ? schema.keySeq().toJS() : [],
    dragging: reduxState.inspector.dragging
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
        return SPAN_OPEN + word + SPAN_CLOSE + ' ';
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
    return this.wrapStr(str, SPAN_OPEN, SPAN_CLOSE);
  };

  public htmlToExpr(html) {
    html = html.split(SPAN_OPEN).join('');
    html = html.split(SPAN_CLOSE).join('');
    return this.htmlDecode(this.wrapStr(html, DATUM, ''));
  };

  public tmplToHtml(str) {
    let position = str.search(TMPL_DATUM);

    while (position !== -1) {
      const next = position + TMPL_OPEN.length + DATUM.length;
      const nextStr = str.substring(next);
      const end = nextStr.search('}}');
      str = str.substring(0, position) + nextStr.substring(0, end) +
        nextStr.substring(end + 2);
      position = str.search(TMPL_DATUM);
    }

    str = this.wrapStr(str, SPAN_OPEN, SPAN_CLOSE);
    return str;
  };

  public htmlToTmpl(html) {
    html = html.split(SPAN_OPEN).join('');
    html = html.split(SPAN_CLOSE).join('');
    return this.htmlDecode(this.wrapStr(html, TMPL_OPEN + DATUM, TMPL_CLOSE));
  };

  public wrapStr(str: string, pre: string, post: string) {
    const fields = this.props.fields;
    const extraLen = pre.length + post.length;

    if (!fields.length && str !== 'Text') {
      return `${pre}${str}${post}`;
    }

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
    const html = (currHtml === 'Text' ? '' : currHtml) + SPAN_OPEN + fieldName + SPAN_CLOSE;
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
