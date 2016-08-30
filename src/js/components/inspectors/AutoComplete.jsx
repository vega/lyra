'use strict';
var $ = require('jquery'),
    React = require('react'),
    ReactDOM = require('react-dom'),
    connect = require('react-redux').connect,
    ContentEditable = require('react-contenteditable'),
    dsUtil = require('../../util/dataset-utils');

var EXPR = 'expr',
    TMPL = 'tmpl',
    SPAN_OPEN  = '<span class="field source" contenteditable="false">',
    SPAN_CLOSE = '</span>',
    DATUM = 'datum.',
    TMPL_OPEN  = '{{',
    TMPL_CLOSE = '}}',
    TMPL_DATUM = new RegExp(TMPL_OPEN + DATUM + '*' + TMPL_CLOSE);

function mapStateToProps(reduxState, ownProps) {
  var schema = dsUtil.schema(ownProps.dsId);
  return {
    fields: Object.keys(schema)
  };
}

var AutoComplete = React.createClass({
  propTypes: {
    type: React.PropTypes.oneOf([EXPR, TMPL]).isRequired,
    dsId: React.PropTypes.number.isRequired,
    fields: React.PropTypes.array.isRequired,
    value: React.PropTypes.string,
    updateFn: React.PropTypes.func.isRequired
  },

  getInitialState: function() {
    var props = this.props,
        value = props.value || '',
        type = props.type,
        html = value;

    if (type === EXPR) {
      html = this.exprToHtml(html);
    } else if (type === TMPL) {
      html = this.tmplToHtml(html);
    }

    return {html: html};
  },

  componentDidMount: function() {
    var contentEditable = ReactDOM.findDOMNode(this),
        handleChange = this.handleChange;

    var strategies = [{
      words: this.props.fields,
      match: /\b(\w{2,})$/,
      search: function(term, callback) {
        callback($.map(this.words, function(word) {
          return word.indexOf(term) === 0 ? word : null;
        }));
      },
      index: 1,
      replace: function(word) {
        return SPAN_OPEN + word + SPAN_CLOSE + ' ';
      }
    }];

    var options = {
      onKeydown: function(e, commands) {
        if (e.keyCode === 32) {
          return commands.KEY_ENTER;
        }
      }
    };

    $(contentEditable).textcomplete(strategies, options)
      .on({'textComplete:select': handleChange});
  },

  exprToHtml: function(str) {
    str = str.split(DATUM).join('');
    return this.wrapStr(str, SPAN_OPEN, SPAN_CLOSE);
  },

  htmlToExpr: function(html) {
    html = html.split(SPAN_OPEN).join('');
    html = html.split(SPAN_CLOSE).join('');
    return this.htmlDecode(this.wrapStr(html, DATUM, ''));
  },

  tmplToHtml: function(str) {
    var position = str.search(TMPL_DATUM),
        next, nextStr, end;

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
  },

  htmlToTmpl: function(html) {
    html = html.split(SPAN_OPEN).join('');
    html = html.split(SPAN_CLOSE).join('');
    return this.htmlDecode(this.wrapStr(html, TMPL_OPEN + DATUM, TMPL_CLOSE));
  },

  wrapStr: function(str, pre, post) {
    var fields = this.props.fields,
        extraLen = pre.length + post.length,
        field, position, searched, nextStr;

    for (var i = 0; i < fields.length; i++) {
      field = fields[i];
      position = str.search(field);
      searched = 0;

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
  },

  htmlDecode: function(input) {
    var e = document.createElement('div');
    e.innerHTML = input;
    return e.childNodes.length === 0 ? '' : e.childNodes[0].nodeValue;
  },

  handleChange: function(evt) {
    var props = this.props,
        type  = props.type,
        value = evt.target.value || evt.target.innerHTML,
        updateFn = props.updateFn;

    if (type === EXPR) {
      updateFn(this.htmlToExpr(value));
    } else if (type === TMPL) {
      updateFn(this.htmlToTmpl(value));
    }

    this.setState({html: value});
  },

  render: function() {
    return (
      <ContentEditable className="autocomplete" html={this.state.html}
        disabled={false} onChange={this.handleChange} />
    );
  }
});

module.exports = connect(mapStateToProps)(AutoComplete);
