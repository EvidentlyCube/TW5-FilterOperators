const assert = require('assert');
const logic = require('../../plugin/susearch-sort-logic');
const helpers = require('./helpers').helpers;

global.$tw = {
	utils: {
		escapeRegExp(s) {
			return s.replace(/[\-\/\\\^\$\*\+\?\.\(\)\|\[\]\{\}]/g, '\\$&');
		}
	}
}
describe('susearch-sort empty query', () => {
	helpers.complexCase('', ['a', '  test']);
});

describe('susearch-sort Single Phrase', () => {
	describe('Prefer earlier to later', () => {
		helpers.complexCase('test', ['test', '  test']);
	});
	describe('Prefer full match to partial match', () => {
		helpers.complexCase('test', ['test', 'testing']);
	});
	describe('Prefer partial match to mid-word match', () => {
		helpers.complexCase('test', ['testing', 'untest']);
	});
	describe('Prefer more matches over fewer match', () => {
		helpers.complexCase('test', ['some test test', 'some test']);
	});
	describe('Prefer earlier match to later match', () => {
		helpers.complexCase('test', ['four test', 'sevennn test']);
	});
	describe('Complex scenario', () => {
		helpers.complexCase('test', [
			'test',
			'testing',
			'space test',
			'space testing',
			'space untesting'
		]);
	});
	describe('Sort alphabetically if query is empty', () => {
		helpers.complexCase('', ['a', 'b', 'c', 'd']);
	});
	describe('Sort alphabetically if all else is equal', () => {
		helpers.complexCase('test', ['a', 'b', 'c', 'd']);
	});
	describe('Upper and lower case are equal unless the words are equal in which case lowercase first', () => {
		helpers.complexCase('test', ['a', 'B', 'c', 'd', 'D']);
	});
});
describe('Multi word', () => {
	describe('More matches is preferred', () => {
		helpers.complexCase('foo bar baz', ['foobarbaz', 'barbaz', 'bazbar', 'foobar']);
	});
	describe('Exact match is preferred', () => {
		helpers.complexCase('duck ate pizza', ['My duck ate pizza but she is fine', 'Duck pizza ate']);
	});
	describe('Word order in query does not matter, word score matters', () => {
		helpers.complexCase('foo bar baz', ['baz', 'the bar', 'some fooing']);
	});
	describe('Words consisting of only special characters will also match', () => {
		helpers.complexCase('$@$', ['$@$', 'text with $@$', 'abc']);
	});
	describe('Full Match > match with special chars > match without special chars', () => {
		helpers.complexCase("foo b@r $", ['foo b@r $', 'b@r', 'test with $', 'aa', 'bb']);
	});
	describe('Words ignore special characters', () => {
		helpers.complexCase("'foo'$# @#@&bar)", ['foo bar is the best baz', 'aaa', 'zzz']);
	});
});