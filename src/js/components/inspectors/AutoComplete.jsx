'use strict';
var React = require('react'),
    ContentEditable = require('../ContentEditable'),
    imutils = require('../../util/immutable-utils'),
    getIn = imutils.getIn,
    getInVis = imutils.getInVis,
    dsUtil = require('../../util/dataset-utils'),
    d3 = require('d3'),
    dl = require('datalib'),
	  ReactDOM = require('react-dom');

    var ContentEditable = require("react-contenteditable");


var spanPreHardcore = '<span class="auto" contenteditable="false">';
var spanPostHardcore = '</span>';

function htmlDecode(input){
  var e = document.createElement('div');
  e.innerHTML = input;
  return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
}

//fun inexpr(stringfromstore)->String html
// @require StringFromStore should be in form of "datumn."
function inExpr(storeString, store) {
  storeString = storeString.split('datum.').join('');
  storeString = insert(storeString, store, spanPreHardcore, spanPostHardcore);
  console.log(storeString);
  return storeString;
}

//Fun outexp(string html)->store string
function outExpr(htmlString, store) {
  htmlString = htmlString.split(spanPreHardcore).join('');
  htmlString = htmlString.split(spanPostHardcore).join('');
  htmlString = insert(htmlString, store, 'datum.', '');
  console.log(htmlDecode(htmlString));
  return htmlDecode(htmlString);
}

// @require storeString should be in form "{{datumn.}}"
function inTmpl(storeString, store) {
  var regex = new RegExp("{{datum.*}}");
  var position = storeString.search(regex);

  while (position != -1) {
    var next = position + 8;

    var nextString = storeString.substring(next);
    var end = nextString.search("}}");
    storeString = storeString.substring(0, position) + nextString.substring(0, end) + nextString.substring(end + 2);
    position = storeString.search(regex);
  }
  storeString = insert(storeString, store, spanPreHardcore, spanPostHardcore);
  //console.log(storeString);
  return storeString;
}

//Fun outtmpl(string html)->store string
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

  for (var i = 0; i < store.length; i ++) {
    var s = store[i];
    var position = targetString.search(s);
    var searched = 0;

    while(position != -1) {
      position = position + searched;
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

    componentDidMount: function() {
      var props = this.props,
          dsId = parseInt(props.dsId),
          schema = dsUtil.schema(dsId),
          keys = dl.keys(schema),
          unContentEditable = ReactDOM.findDOMNode(this),
          contentEditable = ReactDOM.findDOMNode(this).childNodes[0];

      var strategies = [{
                    words: keys,
                    match: /\b(\w{2,})$/,
                    search: function (term, callback) {

                        callback($.map(this.words, function (word) {
                          
                            return word.indexOf(term) === 0 ? word : null;
                        }));
                    },
                    index: 1,
                    replace: function (word) {
                        return '<span class="auto" contenteditable="false">' + word + '</span> ';
                    }
                }];

      var option = {
        appendTo:  $(unContentEditable),
        // onKeydown: onKeydownFunc,
      }

      // var onKeydownFunc = function (e, commands) {
      //   console.log(e.keyCode);
      //   // `commands` has `KEY_UP`, `KEY_DOWN`, `KEY_ENTER`, `KEY_PAGEUP`, `KEY_PAGEDOWN`,
      //   // `KEY_ESCAPE` and `SKIP_DEFAULT`.
      //   if (e.keyCode === 13) {
      //     // Treat CTRL-J as enter key.
      //     console.log(13);
      //     return commands.SKIP_DEFAULT;
      //   }
      //  // If the function does not return a result or undefined is returned,
      // // the plugin uses default behavior.
      // };

   //     $(contentEditable).keypress(function(event) {

       
   //      //alert("Function is Called on Enter");

   //      return event.which !=13; //Add this line to your code

       

   // });

       $(contentEditable).textcomplete(strategies, option);

      
     },

    //  shouldComponentUpdate: function(nextProps){
    //     return nextProps.html !== ReactDOM.findDOMNode(this).childNodes[0].innerHTML;
    // },

    // componentDidUpdate: function(prevProps, prevState){
    //    this.placeCaretAtEnd( document.getElementById("ce") );
    // },
    
    // placeCaretAtEnd: function(el) {
    //     el.focus();
    //     if (typeof window.getSelection != "undefined"
    //         && typeof document.createRange != "undefined") {
    //         var range = document.createRange();
    //         range.selectNodeContents(el);
    //         range.collapse(false);
    //         var sel = window.getSelection();
    //         sel.removeAllRanges();
    //         sel.addRange(range);
    //     } else if (typeof document.body.createTextRange != "undefined") {
    //         var textRange = document.body.createTextRange();
    //         textRange.moveToElementText(el);
    //         textRange.collapse(false);
    //         textRange.select();
    //     }
    // },

     getInitialState: function(){
        var props = this.props,
        value = props.value,
        type = props.type,
        dsId = parseInt(props.dsId),
        schema = dsUtil.schema(dsId),
        keys = dl.keys(schema),
        htmlString = value;

        if (value == undefined) {
          htmlString = "";
        }

      console.log(value);
      if (type == 'expr') {
        htmlString = inExpr(htmlString, keys);
      } else {
        htmlString = inTmpl(htmlString, keys);
      }

      return {html: htmlString};
    },

    handleChange: function(type, value, event) {
      var props = this.props,
        value = props.value,
        type = props.type,
        dsId = parseInt(props.dsId),
        schema = dsUtil.schema(dsId),
        keys = dl.keys(schema),
        updateFn = props.updateFn,
        htmlString;

      if (type == 'expr') {

        // value = event.target.innerHTML;
        // console.log(value);
        updateFn(outExpr(event.target.value, keys));
      } else if (type == 'tmpl') {
        value = outTmpl(event.target.textContent, keys);
        updateFn(outTmpl(event.target.textContent, keys));
      } else {
        console.log("type of AutoComplete can either be expr or tmpl");
      }

      this.setState({html: event.target.value})
    },

  	render: function() {
  		var props = this.props,
  			value = props.value,
  			type = props.type,
        dsId = parseInt(props.dsId),
        schema = dsUtil.schema(dsId),
        keys = dl.keys(schema),
        htmlString = value;

  		return (
        <div className="unce" contentEditable="false">
          <ContentEditable
                className = 'ce'
                html={this.state.html} // innerHTML of the editable div
                disabled={false}       // use true to disable edition
                onChange={this.handleChange.bind(this, type, value)} />
    
        </div>
  		);
  	}

});

module.exports = AutoComplete;