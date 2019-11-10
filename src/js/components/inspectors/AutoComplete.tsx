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
import {State} from '../../store';
import {Schema} from '../../store/factory/Dataset';

interface OwnProps {
  type: 'expr' | 'tmpl';
  dsId: number,
  value: string,
  updateFn: (evt) => void
}

interface StateProps {
  fields: string[];
}

interface OwnState {
  html: string
}

function mapStateToProps(reduxState: State, ownProps: OwnProps): StateProps {
  const schema: Schema = getInVis(reduxState, 'datasets.' + ownProps.dsId + '._schema');
  return {
    fields: schema ? schema.keySeq().toJS() : []
  };
}

class BaseAutoComplete extends React.Component<OwnProps & StateProps, OwnState> {
  constructor(props) {
    super(props);
    this.state = {html: this.toHtml(props.value || '')};
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
    let next;
    let nextStr;
    let end;

    while (position !== -1) {
      next = position + TMPL_OPEN.length + DATUM.length;
      nextStr = str.substring(next);
      end = nextStr.search('}}');
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

  public wrapStr(str, pre, post) {
    const fields = this.props.fields;
    const extraLen = pre.length + post.length;
    let position;
    let searched;
    let nextStr;

    for (const field of fields) {
      position = str.search(field);
      searched = 0

      while (position !== -1) {
        position += searched;
        str = str.substring(0, position) + pre +
          str.substring(position, position + field.length) + post +
          str.substring(position + field.length);
        searched = position + field.length + extraLen;
        nextStr = str.substring(searched);
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
    const dt = evt.dataTransfer;
    const dsId = dt.getData('dsId');
    const fieldDef = JSON.parse(dt.getData('fieldDef'));
    const html = this.state.html + SPAN_OPEN + fieldDef.name + SPAN_CLOSE;
    this.props.updateFn(this.fromHtml(html));
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
export const AutoComplete = connect(mapStateToProps)(BaseAutoComplete);
