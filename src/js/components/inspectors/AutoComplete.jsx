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


var spanPreHardcore = '<span class="auto" contenteditable="false">';
var spanPostHardcore = '</span>';

//Fun outexp(string html)->store string
function outExpr(htmlString, store) {
  htmlString = htmlString.split('<div>').join('');
  htmlString = htmlString.split('</div>').join('');
  htmlString = htmlString.split('<br>').join('');
  htmlString = htmlString.split(spanPreHardcore).join('');
  htmlString = htmlString.split(spanPostHardcore).join('');
  htmlString = insert(htmlString, store, 'datum.', '');
  // console.log(htmlString);
  // var decoded = unescape(htmlString);
  // console.log(decoded);
  return unescape(htmlString);
}



//Fun outtmpl(string html)->store string
function outTmpl(htmlString, store) {
  htmlString = htmlString.split(spanPreHardcore).join('');
  htmlString = htmlString.split(spanPostHardcore).join('');
  htmlString = insert(htmlString, store, '{{datum.', '}}');
  //console.log(unescape(htmlString));
  return unescape(htmlString);
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
      }

      $(unContentEditable).keyup(function(event) {
        return event.which != 13; 
      });

      $(contentEditable).textcomplete(strategies, option);

      
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
        updateFn(outExpr(event.target.textContent, keys));
      } else if (type == 'tmpl') {
        updateFn(outTmpl(event.target.textContent, keys));
      } else {
        console.log("type of AutoComplete can either be expr or tmpl");
      }
    },

  	render: function() {
  		var props = this.props,
  			value = props.value,
  			type = props.type,
        dsId = parseInt(props.dsId),
        schema = dsUtil.schema(dsId),
        keys = dl.keys(schema);

      if (value === undefined) {
        value = "";
      }

  		return (
        <div className="unce" contentEditable="false">
  	 	   <div className="ce" onKeyUp={this.handleChange.bind(this, type, value)} contentEditable="true"></div>
        </div>
  		);
  	}

});

module.exports = AutoComplete;