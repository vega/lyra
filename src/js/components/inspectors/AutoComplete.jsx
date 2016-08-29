'use strict';
var React = require('react'),
    dsUtil = require('../../util/dataset-utils'),
    dl = require('datalib'),
    ReactDOM = require('react-dom'),
    ContentEditable = require('react-contenteditable');


var spanPreHardcore = '<span class="auto" contenteditable="false">';
var spanPostHardcore = '</span>';

function htmlDecode(input) {
  var e = document.createElement('div');
  e.innerHTML = input;
  return e.childNodes.length === 0 ? '' : e.childNodes[0].nodeValue;
}

// fun inexpr(stringfromstore)->String html
// @require StringFromStore should be in form of "datumn."
function inExpr(storeString, store) {
  storeString = storeString.split('datum.').join('');
  storeString = insert(storeString, store, spanPreHardcore, spanPostHardcore);
  console.log(storeString);
  return storeString;
}

// Fun outexp(string html)->store string
function outExpr(htmlString, store) {
  htmlString = htmlString.split(spanPreHardcore).join('');
  htmlString = htmlString.split(spanPostHardcore).join('');
  htmlString = insert(htmlString, store, 'datum.', '');
  console.log(htmlDecode(htmlString));
  return htmlDecode(htmlString);
}

// @require storeString should be in form "{{datumn.}}"
function inTmpl(storeString, store) {
  var regex = new RegExp('{{datum.*}}');
  var position = storeString.search(regex);

  while (position !== -1) {
    var next = position + 8;

    var nextString = storeString.substring(next);
    var end = nextString.search('}}');
    storeString = storeString.substring(0, position) + nextString.substring(0, end) + nextString.substring(end + 2);
    position = storeString.search(regex);
  }
  storeString = insert(storeString, store, spanPreHardcore, spanPostHardcore);
  // console.log(storeString);
  return storeString;
}

// Fun outtmpl(string html)->store string
function outTmpl(htmlString, store) {
  htmlString = htmlString.split(spanPreHardcore).join('');
  htmlString = htmlString.split(spanPostHardcore).join('');
  htmlString = insert(htmlString, store, '{{datum.', '}}');
  console.log(htmlString);
  return htmlDecode(htmlString);
}

// helper function to insert pre and post string to target string
// example: pre = <span> post = </span>
function insert(targetString, store, pre, post) {
  var extraLen = pre.length + post.length;

  for (var i = 0; i < store.length; i++) {
    var s = store[i];
    var position = targetString.search(s);
    var searched = 0;

    while (position !== -1) {
      position += searched;
      targetString = targetString.substring(0, position) + pre + targetString.substring(position, position + s.length) + post + targetString.substring(position + s.length);
      searched = position + s.length + extraLen;
      var nextString = targetString.substring(searched);
      position = nextString.search(s);
    }
  }
  return targetString;
}


var AutoComplete = React.createClass({
  propTypes: {
    type: React.PropTypes.string.isRequired,
    dsId: React.PropTypes.number.isRequired,
    value: React.PropTypes.string,
    updateFn: React.PropTypes.func.isRequired
  },

  getInitialState: function() {
    var props = this.props,
        value = props.value,
        type = props.type,
        dsId = parseInt(props.dsId, 10),
        schema = dsUtil.schema(dsId),
        keys = dl.keys(schema),
        htmlString = value;

    if (value === undefined) {
      htmlString = '';
    }

    // console.log(value);
    if (type === 'expr') {
      htmlString = inExpr(htmlString, keys);
    } else {
      htmlString = inTmpl(htmlString, keys);
    }

    return {html: htmlString};
  },

  componentDidMount: function() {
    var props = this.props,
        dsId = parseInt(props.dsId, 10),
        schema = dsUtil.schema(dsId),
        keys = dl.keys(schema),
        unContentEditable = ReactDOM.findDOMNode(this),
        contentEditable = ReactDOM.findDOMNode(this).childNodes[0];

    var strategies = [{
      words: keys,
      match: /\b(\w{2,})$/,
      search: function(term, callback) {
        callback($.map(this.words, function(word) {
          return word.indexOf(term) === 0 ? word : null;
        }));
      },
      index: 1,
      replace: function(word) {
        return '<span class="auto" contenteditable="false">' + word + '</span> ';
      }
    }];

    var option = {
      appendTo: $(unContentEditable),
    };

    $(contentEditable).textcomplete(strategies, option);
  },

  handleChange: function(event) {
    var props = this.props,
      //  value = props.value,
        type = props.type,
        dsId = parseInt(props.dsId, 10),
        schema = dsUtil.schema(dsId),
        keys = dl.keys(schema),
        updateFn = props.updateFn;
    //    htmlString;

    if (type === 'expr') {
      updateFn(outExpr(event.target.value, keys));
    } else if (type === 'tmpl') {
      updateFn(outTmpl(event.target.textContent, keys));
    } else {
      console.log('type of AutoComplete can either be expr or tmpl');
    }

    this.setState({html: event.target.value});
  },

  render: function() {

    return (
      <div className="unce" contentEditable="false">
        <ContentEditable className = "ce" html={this.state.html} disabled={false} onChange={this.handleChange.bind(this)} />
      </div>
    );
  }
});

module.exports = AutoComplete;