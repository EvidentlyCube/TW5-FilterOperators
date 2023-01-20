/* cSpell:disable */

const assert = require('assert');
const { runComplexCase, runSearch, assertResults } = require('./helpers').helpers;

const RAW_CASE = ":".repeat(100)
	+ 'MATCH'
	+ ':'.repeat(1024);

const HTML_CASE = ":".repeat(100)
	+ '<html-tag attribute="value">MATCH</html-tag>'
	+ ':'.repeat(1024);

describe('focus-on simple cases', () => {
	it('Extract text around the match', () => {
		runComplexCase(['MATCH'], RAW_CASE, `...${':'.repeat(20)}MATCH${':'.repeat(123)}...`);
	});
	it('Customized options', () => {
		runComplexCase(['MATCH', 5, 11, '___'], RAW_CASE, '___:::::MATCH::::::___');
	});
	it('Case insensitive by default', () => {
		runComplexCase(['abc', 3, 5], ":::::ABC:::abc:::::", '...:::ABC::...');
	});
	it('Optionally case sensitive', () => {
		runComplexCase(['abc', 3, 5], ":::::ABC:::abc:::::", '...:::abc::...', ['casesensitive']);
	});
});
describe('focus-on HTML options', () => {
	it('ignore-html', () => {
		runComplexCase(['MATCH', 5, 11], HTML_CASE, `...lue">MATCH</html...`, ['ignore-html']);
	});
	it('expand-html', () => {
		// Defaults to expand-html
		runComplexCase(['MATCH', 5, 11], HTML_CASE, `...<html-tag attribute="value">MATCH</html-tag>...`);
		runComplexCase(['MATCH', 5, 11], HTML_CASE, `...<html-tag attribute="value">MATCH</html-tag>...`, ['expand-html']);
	});
	it('strip-html', () => {
		// Defaults to expand-html
		runComplexCase(['MATCH', 5, 11], HTML_CASE, `...MATCH...`, ['strip-html']);
	});
});
describe('focus-on regexp options', () => {
	const REGEXP_TEXT = ":::::ABF:::::abcde:::::ADE:::::";
	it('regexp', () => {
		runComplexCase(['[ADE]{3}', 3, 5], REGEXP_TEXT, `...:::ADE::...`, ['regexp']);
	});
	it('case-sensitive regexp', () => {
		runComplexCase(['[ab]{2}', 3, 5], REGEXP_TEXT, `...:::abcde...`, ['regexp', 'casesensitive']);
	});
	it('Default to case-insensitive regexp', () => {
		runComplexCase(['[ab]{2}', 3, 5], REGEXP_TEXT, `...:::ABF::...`, ['regexp']);
	});
});