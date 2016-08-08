'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    Immutable = require('immutable'),
    SignalValue = require('../mixins/SignalValue'),
    ContentEditable = require('../ContentEditable'),
    imutils = require('../../util/immutable-utils'),
    getIn = imutils.getIn,
    getInVis = imutils.getInVis,
    TYPES = require('../../constants/primTypes'),
    AutoComplete = require('./AutoComplete'),
    resetMarkVisual = require('../../actions/markActions').resetMarkVisual,
	ReactDOM = require('react-dom');
//	AutoComp = require('jquery-textcomplete');

var store = ['stunning', 'amazing', 'incredible', 'fantastic', 'fantabulous'];
var spanPreHardcore = <span class="auto">;
var spanPostHardcore = </span>;

function mapStateToProps(state, ownProps) {
	return {};
}

function mapDispatchToProps(dispatch) {
  return {};
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
  console.log(htmlString);
  return htmlString;
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
  return htmlString;
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
    	value: React.PropTypes.string,  
   	},



  	render: function() {
  		var props = this.props,
  			value = props.value,
  			type = props.type,
  			htmlString;

  		if (type == "expr") {
  			htmlString = inExpr(value, store)
  		}

  		return (
  			<div>
  				{htmlString}
  			</div>
  		);
  	}

});
module.exports = connect(mapStateToProps,mapDispatchToProps)(AutoComplete);