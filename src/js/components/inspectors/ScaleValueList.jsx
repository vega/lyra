'use strict';

var React = require('react'),
    Immutable = require('immutable'),
    connect = require('react-redux').connect,
    imutils = require('../../util/immutable-utils'),
    getInVis = require('../../util/immutable-utils').getInVis,
    getIn = imutils.getIn,
    Property = require('./Property'),
    updateScaleProperty = require('../../actions/scaleActions').updateScaleProperty,
    primTypes = require('../../constants/primTypes'),
    assets = require('../../util/assets'),
    Icon = require('../Icon');

var ScaleValueList = React.createClass({
	propTypes: {
		//updateFn: React.PropTypes.func.isRequired,
        scaleProp: React.PropTypes.string.isRequired, // should represent an array
        scale: React.PropTypes.instanceOf(Immutable.Map).isRequired
	},

    parseValue: function(val) {
        if (isNaN(+val) || val === '') {
            return val;
        } else {
            return +val;
        }
    },

	getInitialState: function() {
		var frontValues = getIn(this.props.scale, this.props.scaleProp) || [],
            lastValue = '';
            
    	return ({frontValues: frontValues,
                lastValue: lastValue});
	},

    handleValueChange: function(key, evt) {
        var frontValues = this.state.frontValues,
            value = this.parseValue(evt.target.value),
            lastValue = this.state.lastValue;

        if(key >= frontValues.length) {
            lastValue = value;
            this.setState({lastValue});
        } else {
            frontValues[key] = value;
            this.setState({frontValues});
        }      
    },

    addVal: function() {
        var frontValues = this.state.frontValues,
            lastValue = this.state.lastValue;

        frontValues.push(lastValue);
        lastValue = '';

        this.setState({frontValues});
        this.setState({lastValue});
    },

    deleteVal: function(key) {
        var frontValues = this.state.frontValues;
        
        frontValues.splice(key, 1);
        this.setState({frontValues});
    },

    render: function() {
        var frontValues = this.state.frontValues,
            lastValue = this.state.lastValue,
            lastIndex = frontValues.length,
            valueHTML = [];

        for (var i = 0; i < frontValues.length; i++) {
            var value = frontValues[i];
            valueHTML.push(<div key={i}>
                                <Property type='text' name='scaleProp' value={value} onChange={this.handleValueChange.bind(this, i)}/>
                                <Icon glyph={assets.close} width="12" height="12" onClick={this.deleteVal.bind(this, i)}/>
                            </div>);
        }

        return (
            <div>
                {valueHTML}
                <div key={lastIndex}>
                    <Property type='text' name='scaleProp' value={lastValue} onChange={this.handleValueChange.bind(this, lastIndex)}/>
                    <Icon glyph={assets.plus} width="12" height="12" onClick={this.addVal.bind(this, lastIndex)}/>
                </div>
            </div>
        );

    }

});

module.exports = ScaleValueList;