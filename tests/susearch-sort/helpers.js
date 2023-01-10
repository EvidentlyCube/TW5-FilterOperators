const assert = require('assert');
const logic = require('../../plugin/susearch-sort-logic');

const toTitle = (text, index) => `ID:${index} -- ${text}`;
const helpers = {
	complexCase(query, expectedTitles) {
		it("Title field", () => {
			runCase(query, 'title', expectedTitles.map(x => ({title: x})), expectedTitles);
		});
		it("Title field, reversed input", () => {
			runCase(query, 'title', expectedTitles.map(x => ({title: x})).reverse(), expectedTitles);
		});
		it("Text field", () => {
			runCase(
				query,
				'text',
				expectedTitles.map((title, index) => ({title: toTitle(title, index), text: title})),
				expectedTitles.map(toTitle)
			);
		});
		it("Text field, reversed input", () => {
			runCase(
				query,
				'text',
				expectedTitles.map((title, index) => ({title: toTitle(title, index), text: title})).reverse(),
				expectedTitles.map(toTitle)
			);
		});
	},

	simpleCase(query, givenTitles) {
		const testData = givenTitles.map(x => ({title: x}));
		const testDataReversed = testData.concat().reverse();
		const result = logic.sort(testData, query, 'title');
		const resultFromReversed = logic.sort(testDataReversed, query, 'title');

		this.assertSort(result, givenTitles, "Failed in non-reversed scenario");
		this.assertSort(resultFromReversed, givenTitles, "Failed in reversed scenario");
	},

	assertSort(given, expectedTitles, message) {
		const givenTitles = given.map(x => x.title);

		assert.deepStrictEqual(givenTitles, expectedTitles, message);
	}
}

function runCase(query, field, testData, expectedTitles) {
	const result = logic.sort(testData, query, field);

	helpers.assertSort(result, expectedTitles);
}

exports.helpers = helpers;