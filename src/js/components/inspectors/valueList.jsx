'use strict';

var React = require('react'),
    Immutable = require('immutable'),
    connect = require('react-redux').connect,
    imutils = require('../../util/immutable-utils'),
    getInVis = require('../../util/immutable-utils').getInVis,
    getIn = imutils.getIn,
    Property = require('./Property'),
    updateScaleProperty = require('../../actions/scaleActions').updateScaleProperty,
    primTypes = require('../../constants/primTypes');

var ScaleValueList = React.createClass({
	propTypes: {
		updateFn: React.PropTypes.func.isRequired
	},

	var valueList=[];

	getInitialState: function() {
		var mapKeyToDomainVal = new Map(),
        	domainValKey = 0;
    	return ({mapKeyToDomainVal: mapKeyToDomainVal,
    		domainValKey: domainValKey});
	}



	

});

module.exports = 