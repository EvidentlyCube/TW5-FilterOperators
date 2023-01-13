/*\
title: $:/plugins/EvidentlyCube/ExtraOperators/susearch-mark.js
type: application/javascript
module-type: filteroperator

Smart sorting of search results

\*/
(function (require) {
	/*jslint node: true, browser: true */
	/*global $tw: false */
	"use strict";

	const common = require('$:/plugins/EvidentlyCube/ExtraOperators/common.js');

	exports['susearch-mark'] = function (source, operator, opts) {
		const query = operator.operand || '';
		const suffixes = (operator.suffixes || []);
		const optionFlags = suffixes[0] || [];
		const options = {
			mode: extractMode(optionFlags),
			wiki: opts.wiki
		};

		const sanitizedQuery = query.replace(/\s+/g, ' ').trim().toLowerCase();
		const words = sanitizedQuery.split(' ').filter(word => word);
		const simplifiedWords = sanitizedQuery.replace(common.SIMPLIFY_REGEXP, '').split(' ').filter(word => word);

		const regexpPieces = [$tw.utils.escapeRegExp(sanitizedQuery)];
		regexpPieces.push(...words.map(word => $tw.utils.escapeRegExp(word)));
		regexpPieces.push(...simplifiedWords.map(word => $tw.utils.escapeRegExp(word)));

		const fullRegexp = new RegExp('(' + regexpPieces.join("|").replace(/ /g, '\\s+') + ')', 'gi');
		const titles = [];

		source(function (tiddler, title) {
			titles.push(mark(title, fullRegexp, options));
		});

		return titles;
	};

	function mark(title, fullRegexp, options) {
		switch (options.mode) {
			case 'default':
				return title.replace(fullRegexp, '<mark>$1</mark>');

			case 'raw-strip':
			case 'wikify-strip':
				const text = wikify(title, options.wiki, false).textContent;
				return text.replace(fullRegexp, '<mark>$1</mark>');

			case 'wikify-safe':
		}
	}

	function wikify(text, wiki, isInline) {
		const parser = wiki.parseText("text/vnd.tiddlywiki", text, {parseAsInline: isInline });
		const container = $tw.fakeDocument.createElement("div");
		const widget = wiki.makeWidget(parser, {
			document: $tw.fakeDocument,
			parentWidget: $tw.rootWidget
		});
		widget.render(container, null);

		return container;
	}

	function prepareField(field, options) {
		if (options.textOnly) {
			return common.TEXT_ONLY_REGEXPS.reduce((field, [regexp, replace]) => field.replace(regexp, replace), field);
		}
		return field;
	}

	function extractMode(optionFlags) {
		switch (optionFlags.join(',')) {
			case 'raw-strip': return 'raw-strip';
			case 'wikify-strip': return 'wikify-strip';
			case 'wikify-safe': return 'wikify-safe';
			default: return 'default';
		}
	}

})(typeof global !== 'undefined' ? global.testRequire : require);
