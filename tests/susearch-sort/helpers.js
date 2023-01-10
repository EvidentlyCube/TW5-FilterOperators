const assert = require('assert');
const filter = require('../../plugin/susearch-sort')['susearch-sort'];

const toTitle = (text, index) => `ID:${index} -- ${text}`;
const toTiddler = (title, text) => ({fields: {title, text}});
const helpers = {
	complexCase(query, expectedTitles) {
		it("Title field", () => {
			runCase(query, 'title', expectedTitles.map(title => toTiddler(title)), expectedTitles);
		});
		it("Title field, reversed input", () => {
			runCase(query, 'title', expectedTitles.map(title => toTiddler(title)).reverse(), expectedTitles);
		});
		it("Text field", () => {
			runCase(
				query,
				'text',
				expectedTitles.map((title, index) => toTiddler(toTitle(title, index), title)),
				expectedTitles.map(toTitle)
			);
		});
		it("Text field, reversed input", () => {
			runCase(
				query,
				'text',
				expectedTitles.map((title, index) => toTiddler(toTitle(title, index), title)).reverse(),
				expectedTitles.map(toTitle)
			);
		});
	},

	runSort(tiddlers, query, sortField) {
		return filter(
			callback =>{
				for (const tiddler of tiddlers) {
					callback(tiddler, tiddler.fields.title);
				}
			},
			{
				operand:query,
				suffixes: [[sortField]]
			}
		);
	},

	assertSort(givenTitles, expectedTitles, message) {
		assert.deepStrictEqual(givenTitles, expectedTitles, message);
	}
}

function runCase(query, field, testData, expectedTitles) {
	const result = helpers.runSort(testData, query, field);

	helpers.assertSort(result, expectedTitles);
}

exports.helpers = helpers;