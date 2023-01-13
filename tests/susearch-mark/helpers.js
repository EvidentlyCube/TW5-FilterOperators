const assert = require('assert');
const filter = require('../../plugin/susearch-mark')['susearch-mark'];

const helpers = {
	runComplexCase(query, given, then, options, message) {
		given = !Array.isArray(given) ? [given] : given;
		then = !Array.isArray(then) ? [then] : then;

		const result = helpers.runMark(
			given.map(title => ({fields: {title}})),
			query,
			options
		);

		helpers.assertResults(result, then, message);
	},

	runMark(tiddlers, query, options) {
		return filter(
			callback =>{
				for (const tiddler of tiddlers) {
					callback(tiddler, tiddler.fields.title);
				}
			},
			{
				operand: query,
				suffixes: [
					options || []
				]
			},
			{
				wiki: global.$tw.wiki
			}
		);
	},

	assertResults(givenTitles, expectedTitles, message) {
		assert.deepStrictEqual(givenTitles.concat().sort(), expectedTitles.concat().sort(), message);
	}
}

exports.helpers = helpers;