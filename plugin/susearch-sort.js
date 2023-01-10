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

	exports['susearch-sort'] = function(source, operator, options) {
		const query = operator.operand || '';
		const suffixes = (operator.suffixes || []);
		const fieldName = (suffixes[0] || [])[0] || 'title';
		const records = [];

		source(function(tiddler, title) {
			records.push(tiddler ? tiddler.fields : {title: title});
		});

		return susearchSort(records, query, fieldName).map(record => record.title);
	};


	const SIMPLIFY_REGEXP = /[^a-z0-9_-]/ig;
	/**
	 * @param {object} records
	 * @param {string} query
	 * @param {string} sortField
	 * @returns
	 */
	function susearchSort(records, query, sortField) {
		const sanitizedQuery = query.replace(/\s+/g, ' ').trim();
		const words = sanitizedQuery.split(' ').filter(word => word);
		const simplifiedWords = sanitizedQuery.replace(SIMPLIFY_REGEXP, '').split(' ').filter(word => word);

		if (words.length === 0) {
			return textSort(records, sortField);

		} else if (words.length === 1) {
			return sortInternal(records, sanitizedQuery, [], [], sortField);

		} else {
			return sortInternal(records, sanitizedQuery, words, simplifiedWords, sortField);
		}
	};

	function textSort(records, sortField) {
		return records.concat().sort(function (left, right) {
			if (!left[sortField] && !right[sortField]) {
				return 0;
			} else if (!left[sortField]) {
				return 1;
			} else if (!right[sortField]) {
				return -1;
			}

			return left[sortField].localeCompare(right[sortField], { numeric: true, sensitivity: "base" });
		});
	}

	function sortInternal(records, query, words, simplifiedWords, sortField) {
		const fullQueryRegexps = [query, getRegexpsForPhrase(query)];
		const wordsRegexps = words.map(word => [word, getRegexpsForPhrase(word)]);
		const simplifiedWordsRegexps = simplifiedWords.map(word => [word, getRegexpsForPhrase(word)]);
		const scores = records.map(record => getScore(record, sortField, fullQueryRegexps, wordsRegexps, simplifiedWordsRegexps));

		scores.sort(recordsSortCallback);

		return scores.map(x => x[4]);
	}

	function recordsSortCallback(left, right) {
		if (left[0][0] !== right[0][0]) {
			return right[0][0] - left[0][0];

		} else if (left[0][1] !== right[0][1]) {
			return right[0][1] - left[0][1];

		} else if (left[0][2] !== right[0][2]) {
			return left[0][2] - right[0][2];

		} else if (left[1].length !== right[1].length) {
			return right[1].length - left[1].length;

		} else {
			for (let i = 0; i < left[1].length; i++) {
				if (left[1][i][0] !== right[1][i][0]) {
					return right[1][i][0] - left[1][i][0];

				} else if (left[1][i][1] !== right[1][i][1]) {
					return right[1][i][1] - left[1][i][1];
				}
			}
		}

		if (left[2].length !== right[2].length) {
			return right[2].length - left[2].length;

		} else {
			for (let i = 0; i < left[2].length; i++) {
				if (left[2][i][0] !== right[2][i][0]) {
					return right[2][i][0] - left[2][i][0];

				} else if (left[2][i][1] !== right[2][i][1]) {
					return right[2][i][1] - left[2][i][1];
				}
			}
		}

		const sameCaseScore = left[3][0].localeCompare(right[3][0], { numeric: true, sensitivity: "base" });
		return sameCaseScore || left[3][1].localeCompare(right[3][1], { numeric: true, sensitivity: "base" })
	}

	function getRegexpsForPhrase(phrase) {
		const escapedPhrase = $tw.utils.escapeRegExp(phrase);

		return [
			new RegExp(`^${escapedPhrase}\\b`, 'gi'),
			new RegExp(`^${escapedPhrase}`, 'gi'),
			new RegExp(`\\b${escapedPhrase}\\b`, 'gi'),
			new RegExp(`\\b${escapedPhrase}`, 'gi'),
			new RegExp(escapedPhrase, 'gi'),
		]
	}

	function getScore(record, sortField, fullQueryRegexp, wordsRegexps, simplifiedWordsRegexps) {
		const field = record[sortField] || '';
		const simplifiedField = field.replace(SIMPLIFY_REGEXP, '');
		const fullQueryScore = getRegexpScore(field, fullQueryRegexp[0], fullQueryRegexp[1]);
		const wordScores = wordsRegexps
			.map(r => getRegexpScore(field, r[0], r[1]))
			.filter(x => x)
			.sort(wordSortCallback);
		const simplifiedWordScores = simplifiedWordsRegexps
			.map(r => getRegexpScore(simplifiedField, r[0], r[1]))
			.filter(x => x)
			.sort(wordSortCallback);

		return [
			fullQueryScore || [-1, -1, Number.MAX_SAFE_INTEGER], // Full query score match type
			wordScores, // Word scores
			simplifiedWordScores, // Word scores
			[field.toLowerCase(), field], // Field
			record // Record
		];
	}

	function wordSortCallback(left, right) {
		if (left[0] !== right[0]) {
			return right[0] - left[0];

		} else if (left[1] !== right[1]) {
			return right[1] - left[1];

		} else {
			return left[2] - right[2];
		}
	}

	function getRegexpScore(text, query, regexps) {
		for (let i = 0; i < regexps.length; i++) {
			const matches = regexpCount(text, regexps[i]);
			if (matches === 0) {
				continue;
			}

			return [
				regexps.length - i,
				matches * 10000
				+ regexpCount(text, regexps[regexps.length - 1]),
				text.toLowerCase().indexOf(query.toLowerCase())
			];
		}

		return null;
	}

	function regexpCount(text, regexp) {
		const matches = text.match(regexp);

		return matches ? matches.length : 0;
	}

})();
