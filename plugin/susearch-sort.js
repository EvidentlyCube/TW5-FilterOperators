/*\
title: $:/plugins/EvidentlyCube/ExtraOperators/susearch-sort.js
type: application/javascript
module-type: filteroperator

Smart sorting of search results

\*/
(function(){

	/*jslint node: true, browser: true */
	/*global $tw: false */
	"use strict";

	const sort = require('$:/plugins/EvidentlyCube/ExtraOperators/susearch-sort-logic.js').sort;
	exports['susearch-sort'] = function(source, operator, options) {
		const query = operator.operand || '';
		const suffixes = (operator.suffixes || []);
		const fieldName = (suffixes[0] || [])[0] || 'title';
		const records = [];

		source(function(tiddler, title) {
			records.push(tiddler ? tiddler.fields : {title: title});
		});

		return sort(records, query, fieldName).map(record => record.title);
	};
})();
