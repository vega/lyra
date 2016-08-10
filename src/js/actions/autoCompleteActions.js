'use strict'
var UPDATE_EXPRESSION_OR_TEMPLATE = 'UPDATE_EXPRESSION_OR_TEMPLATE';

function updateExprOrTmpl(path, value) {
	return {
		type: UPDATE_EXPRESSION_OR_TEMPLATE,
		path: path,
		value: value
	};
}

module.exports = {
	// Action Name
	UPDATE_EXPRESSION_OR_TEMPLATE: UPDATE_EXPRESSION_OR_TEMPLATE,

	// Action Creators
	updateExprOrTmpl: updateExprOrTmpl
}