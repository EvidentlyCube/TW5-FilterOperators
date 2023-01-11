const assert = require('assert');
const filter = require('../../plugin/susearch')['susearch'];

const toTitle = (text, index) => `ID:${index} -- ${text}`;
const toTiddler = (title, text) => ({fields: {title, text}});
const helpers = {
	runComplexCase(query, expectedTitles, notExpectedTitles, options) {
		const all = expectedTitles.concat(notExpectedTitles);
		it("Title field", () => {
			runCase(
				query,
				'title',
				all.map(title => toTiddler(title)),
				expectedTitles,
				options
			);
		});
		it("Text field", () => {
			runCase(
				query,
				'text',
				all.map((title, index) => toTiddler(toTitle(title, index), title)),
				expectedTitles.map(toTitle),
				options
			);
		});
	},

	runSearch(tiddlers, query, searchField, options) {
		return filter(
			callback =>{
				for (const tiddler of tiddlers) {
					callback(tiddler, tiddler.fields.title);
				}
			},
			{
				operand: query,
				suffixes: [
					[searchField],
					options || []
				]
			}
		);
	},

	assertResults(givenTitles, expectedTitles, message) {
		assert.deepStrictEqual(givenTitles.concat().sort(), expectedTitles.concat().sort(), message);
	}
}

function runCase(query, field, testData, expectedTitles, options) {
	const result = helpers.runSearch(testData, query, field, options);

	helpers.assertResults(result, expectedTitles);
}

exports.helpers = helpers;