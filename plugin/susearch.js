/*\
title: $:/plugins/EvidentlyCube/ExtraOperators/susearch.js
type: application/javascript
module-type: filteroperator

Smart sorting of search results

\*/
(function(require){

	/*jslint node: true, browser: true */
	/*global $tw: false */
	"use strict";

	const common = require('$:/plugins/EvidentlyCube/ExtraOperators/common.js');

	exports.susearch = function(source, operator) {
		const query = operator.operand || '';
		const suffixes = (operator.suffixes || []);
		const optionFlags = suffixes[1] || [];
		const options = {
			field: (suffixes[0] || [])[0] || 'title',
			textOnly: optionFlags.indexOf('raw-strip') !== -1
		};

		const sanitizedQuery = query.replace(/\s+/g, ' ').trim().toLowerCase();
		const words = sanitizedQuery.split(' ').filter(word => word);
		const simplifiedWords = sanitizedQuery.replace(common.SIMPLIFY_REGEXP, '').split(' ').filter(word => word);

		const titles = [];

		source(function(tiddler, title) {
			if (susearch(tiddler ? tiddler.fields : {title: title}, options, sanitizedQuery, words, simplifiedWords)) {
				titles.push(title);
			}
		});

		return titles;
	};

	function susearch(record, options, sanitizedQuery, words, simplifiedWords) {
		const field = prepareField(record[options.field] || '', options).toLowerCase();
		const simplifiedField = field.replace(common.SIMPLIFY_REGEXP, '');

		if (field.indexOf(sanitizedQuery) !== -1) {
			return true;
		}

		for (const word of words) {
			if (field.indexOf(word) !== -1) {
				return true;
			}
		}

		for (const word of simplifiedWords) {
			if (simplifiedField.indexOf(word) !== -1) {
				return true;
			}
		}

		return false;
	}

	function prepareField(field, options) {
		if (options.textOnly) {
			return common.TEXT_ONLY_REGEXPS.reduce((field, [regexp, replace]) => field.replace(regexp, replace), field);
		}
		return field;
	}

})(typeof global !== 'undefined' ? global.testRequire : require);
