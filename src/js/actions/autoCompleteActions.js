'use strict'
var UPDATE_EXPRESSION = 'UPDATE_EXPRESSION';

function updateExpr(exprPath, exprValue) {
	return {
		type: UPDATE_EXPRESSION,
		path: exprPath,
		value: exprValue
	};
}

module.exports = {
	// Action Name
	UPDATE_EXPRESSION: UPDATE_EXPRESSION,

	// Action Creators
	updateExpr: updateExpr
}