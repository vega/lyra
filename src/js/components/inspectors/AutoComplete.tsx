'use strict';
const $ = require('jquery');
const React = require('react');
const ReactDOM = require('react-dom');
const connect = require('react-redux').connect;
const ContentEditable = require('react-contenteditable');
const getInVis = require('../../util/immutable-utils').getInVis;

const EXPR = 'expr';
const TMPL = 'tmpl';
const SPAN_OPEN  = '<span class="field source" contenteditable="false">';
const SPAN_CLOSE = '</span>';
const DATUM = 'datum.';
const TMPL_OPEN  = '{{';
const TMPL_CLOSE = '}}';
const TMPL_DATUM = new RegExp(TMPL_OPEN + DATUM + '*' + TMPL_CLOSE);

function mapStateToProps(reduxState, ownProps) {
  const schema = getInVis(reduxState, 'datasets.' + ownProps.dsId + '._schema');
  return {
    fields: schema.keySeq().toJS()
  };
}

interface AutoCompleteProps {
  type: any, // propTypes.oneOf([EXPR, TMPL]).isRequired,
  dsId: number,
  fields: any,
  value: string,
  updateFn: () => any
}

class BaseAutoComplete extends React.Component<AutoCompleteProps> {
  public getInitialState() {
    const props = this.props;
    const value = props.value || '';
    const type = props.type;
 let html = value;

 if (type === EXPR) {
      html = this.exprToHtml(html);
    } else if (type === TMPL) {
      html = this.tmplToHtml(html);
    }

    return {html: html};
  };

  public componentDidMount() {
    const contentEditable = ReactDOM.findDOMNode(this);
    const handleChange = this.handleChange;

    const strategies = [{
      words: this.props.fields,
      match: /\b(\w{2,})$/,
      search: function(term, callback) {
        callback($.map(this.words, function(word) {
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

    $(contentEditable).textcomplete(strategies, options)
      .on({'textComplete:select': handleChange});
  };

  public exprToHtml(str) {
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
    let field;
    let position;
    let searched;
    let nextStr;

    // for (let i = 0; i < fields.length; i++)
    for (const i of fields.length) {
      field = fields[i];
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

  public handleChange(evt) {
    const props = this.props;
    const type  = props.type;
    const value = evt.target.value || evt.target.innerHTML || '';
    const updateFn = props.updateFn;

    if (type === EXPR) {
      updateFn(this.htmlToExpr(value));
    } else if (type === TMPL) {
      updateFn(this.htmlToTmpl(value));
    }

    this.setState({html: value});
  };

  public render() {
    return (
      <ContentEditable className='autocomplete' html={this.state.html}
        disabled={false} onChange={this.handleChange} />
    );
  }
};
export const AutoComplete = connect(mapStateToProps)(BaseAutoComplete);
