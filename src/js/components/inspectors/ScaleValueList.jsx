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
		updateFn: React.PropTypes.func.isRequired,
        scaleProp: React.PropTypes.string.isRequired, // should represent an array
        scale: React.PropTypes.instanceOf(Immutable.Map).isRequired,
        propType: React.PropTypes.string.isRequired
	},

    parseInValue: function(value) {
        if (isNaN(+value) || value === '') {
            return value;
        } else {
            return +value;
        }
    },

	getInitialState: function() {
		var values = [];
        values.push('');
        var valuesParsed = values.slice(0);
    	return ({values: values,
                valuesParsed: valuesParsed});
	},

    handleValueChange: function(key, evt) {
        var value = evt.target.value,
            values = this.state.values,
            valuesParsed = this.state.valuesParsed,
            updateFn = this.props.updateFn;

        console.log(values);
        console.log(values.length);

        values[key] = value;
        this.setState({values: values});

        valuesParsed[key] = this.parseInValue(value);
        this.setState({valuesParsed: valuesParsed});
        updateFn(valuesParsed);
    },

    addVal: function() {
        var values = this.state.values,
            valuesParsed = this.state.valuesParsed;

        values.push('');
        valuesParsed.push('');
        this.setState({values});
        this.setState({valuesParsed});
    },

    deleteVal: function(key) {
        var values = this.state.values,
            valuesParsed = this.state.valuesParsed,
            updateFn = this.props.updateFn;
        
        values.splice(key, 1);
        this.setState({values});

        valuesParsed.splice(key, 1);
        this.setState({valuesParsed});
        
        updateFn(valuesParsed);
    },

    render: function() {
        var   values = this.state.values, 
        lastIndex = values.length - 1,
        lastValue = values[lastIndex],
        propType = this.props.propType,
            
        valueHTML = [],
        lastHTML;

        if (propType === 'text') {
            for (var i = 0; i < lastIndex; i++) {
                var value = values[i];
                valueHTML.push(<div key={i}>
                                <Property type='text' name='scaleProp' value={value} onBlur={this.handleValueChange.bind(this, i)}/>
                                <Icon glyph={assets.close} width="12" height="12" onClick={this.deleteVal.bind(this, i)}/>
                            </div>);
            }

            lastHTML = (
                <div key={lastIndex}>
                    <Property type={propType} name='scaleProp' value={lastValue} onBlur={this.handleValueChange.bind(this, lastIndex)}/>
                    <Icon glyph={assets.plus} width="12" height="12" onClick={this.addVal.bind(this, lastIndex)}/>
                </div>
            );
        } else {
            for (var i = 0; i < lastIndex; i++) {
                var value = values[i];
                valueHTML.push(<div key={i}>
                                <Property type='color' name='scaleProp' value={value} onChange={this.handleValueChange.bind(this, i)}/>
                                <Icon glyph={assets.close} width="12" height="12" onClick={this.deleteVal.bind(this, i)}/>
                            </div>);
            }
            lastHTML = (
                <div key={lastIndex}>
                    <Property type='color' name='scaleProp' value={lastValue} onChange={this.handleValueChange.bind(this, lastIndex)}/>
                    <Icon glyph={assets.plus} width="12" height="12" onClick={this.addVal.bind(this, lastIndex)}/>
                </div>
            );
        }

        return (
            <div>
                {valueHTML}
                {lastHTML} 
            </div>    
        );

    }

});

module.exports = ScaleValueList;