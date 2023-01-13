/*\
title: $:/plugins/EvidentlyCube/ExtraOperators/susearch-mark.js
type: application/javascript
module-type: filteroperator

Smart sorting of search results

\*/
(function(require){

	/*jslint node: true, browser: true */
	/*global $tw: false */
	"use strict";

	const common = require('$:/plugins/EvidentlyCube/ExtraOperators/common.js');

	exports['susearch-mark'] = function(source, operator) {
		const query = operator.operand || '';
		const suffixes = (operator.suffixes || []);
		const optionFlags = suffixes[1] || [];
		const options = {
			textOnly: optionFlags.indexOf('text-only') !== -1
		};

		const sanitizedQuery = query.replace(/\s+/g, ' ').trim().toLowerCase();
		const words = sanitizedQuery.split(' ').filter(word => word);
		const simplifiedWords = sanitizedQuery.replace(common.SIMPLIFY_REGEXP, '').split(' ').filter(word => word);

		const regexpPieces = [$tw.utils.escapeRegExp(sanitizedQuery)];
		regexpPieces.push(...words.map(word => $tw.utils.escapeRegExp(word)));
		regexpPieces.push(...simplifiedWords.map(word => $tw.utils.escapeRegExp(word)));

		const fullRegexp = new RegExp('(' + regexpPieces.join("|").replace(/ /g, '\\s+') + ')', 'gi');
		const titles = [];

		source(function(tiddler, title) {
			titles.push(mark(title, fullRegexp, options));
		});

		return titles;
	};

	function mark(title, fullRegexp, options) {
		return title.replace(fullRegexp, '<mark>$1</mark>');
	}

	function prepareField(field, options) {
		if (options.textOnly) {
			return common.TEXT_ONLY_REGEXPS.reduce((field, [regexp, replace]) => field.replace(regexp, replace), field);
		}
		return field;
	}

})(typeof global !== 'undefined' ? global.testRequire : require);
