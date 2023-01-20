const assert = require('assert');
const { runComplexCase, runSearch, assertResults } = require('./helpers').helpers;

describe('susearch empty query returns everything', () => {
	runComplexCase('', ['', 'b', 'test'], []);
});

describe('susearch simple cases', () => {
	describe('Match full phrase', () => {
		runComplexCase('much testing', ['much testing', 'this is much testing result'], ['soup']);
	});
	describe('Match individual words', () => {
		runComplexCase('much testing', ['much', 'testing', 'testing is too much'], ['soup']);
	});
	describe('Match words partially', () => {
		runComplexCase('much testing', ['mucho', 'atesting', 'atestingo is too amucho'], ['soup']);
	});
	describe('Match words with special characters', () => {
		runComplexCase('$econd$', ['$econd$', 'I have a few $econd$ to spare'], ['soup']);
	});
	describe('Match words while trimming special characters', () => {
		runComplexCase('$econd$', ['econd', '@econd@'], ['soup']);
	});
	describe('Only special characters will also match', () => {
		runComplexCase('$#@', ['$#@', '$#@@#$'], ['$@#']);
	});
	describe('Search is case-insensitive', () => {
		runComplexCase('TEST', ['test', 'TesT', 'TEST'], ['soup']);
	});
});
describe('susearch raw-strip flag', () => {
	const mashup = (text, prefix="a", suffix="b") => {
		const prefixes = ['', "\n", "\r\n", `${prefix}\n`, `${prefix}\r\n`];
		const suffixes = ['', "\n", "\r\n", `\n${suffix}`, `\r\n${suffix}`];
		return prefixes.reduce((all, prefix) => {
			return all.concat(...suffixes.map(suffix => `${prefix}${text}${suffix}`));
		}, [])
	};

	describe('HTML Tags -> Include by default', () => {
		runComplexCase('test', ['test', ...mashup('<a href="test">')], []);
	});
	describe('HTML Tags -> Exclude in `raw-strip`', () => {
		runComplexCase('test', ['test'], mashup('<a href="test">'), ['raw-strip']);
	});
	describe('Macro invocations -> Include by default', () => {
		runComplexCase('test', ['test', ...mashup('<<test>>')], []);
	});
	describe('Macro Invocations -> Exclude in `raw-strip`', () => {
		runComplexCase('test', ['test'], mashup('<<test>>'), ['raw-strip']);
	});
	describe('Filter invocations -> Include by default', () => {
		runComplexCase('test', ['test', ...mashup('{{{test}}}')], []);
	});
	describe('Filter Invocations -> Exclude in `raw-strip`', () => {
		runComplexCase('test', ['test'], mashup('{{{test}}}'), ['raw-strip']);
	});
	describe('Transclusions -> Include by default', () => {
		runComplexCase('test', ['test', ...mashup('{{test}}')], []);
	});
	describe('Transclusions -> Exclude in `raw-strip`', () => {
		runComplexCase('test', ['test'], mashup('{{test}}'), ['raw-strip']);
	});
	describe('Images -> Include by default', () => {
		runComplexCase('test', ['test', ...mashup('[img class="test" [test.jpg]]')], []);
	});
	describe('Images -> Exclude in `raw-strip`', () => {
		runComplexCase('test', ['test'], mashup('[img class="test" [test.jpg]]'), ['raw-strip']);
	});
	const MACRO_DEF_MULTILINE_N = "\\define a(a b c)\ntest\n\\end";
	const MACRO_DEF_MULTILINE_RN = "\\define bbb(a b c)\r\ntest\r\n\\end";
	const MACRO_DEF_SINGLELINE1 = "\\define ccccc(a b c) test";
	describe('Macro Definitions -> Include by default', () => {
		runComplexCase('test', [
			...mashup(MACRO_DEF_MULTILINE_N),
			...mashup(MACRO_DEF_MULTILINE_RN),
			...mashup(MACRO_DEF_SINGLELINE1),
			"test"
		]);
	});
	describe('Macro Definitions -> Exclude in `raw-strip`', () => {
		runComplexCase('test',
			['test'], [
				...mashup(MACRO_DEF_MULTILINE_N),
				...mashup(MACRO_DEF_MULTILINE_RN),
				...mashup(MACRO_DEF_SINGLELINE1),
		], ['raw-strip']);
	});
	describe('Arbitrary Pragmas at the start -> Include by default', () => {
		runComplexCase('test', ['test', ...mashup("\\test", "\n  \r\n")], []);
	});
	describe('Arbitrary Pragmas at the start -> Exclude in `raw-strip`', () => {
		runComplexCase('test', ['test'], mashup("\\test", "\n  \r\n"), ['raw-strip']);
	});
	describe('Styles -> Include by default', () => {
		runComplexCase('test', ['test', ...mashup("@@.test")], []);
	});
	describe('Styles -> Exclude in `raw-strip`', () => {
		runComplexCase('test', ['test'], mashup("@@.test"), ['raw-strip']);
	});
	describe('Typed blocks -> Include by default', () => {
		runComplexCase('test', ["test",...mashup("$$$application/test")]);
	});
	describe('Typed blocks -> Exclude in `raw-strip`', () => {
		runComplexCase('test', ["test"], mashup("$$$application/test"), ['raw-strip']);
	});
	describe('Manual link target -> Include by default', () => {
		runComplexCase('test', [...mashup('[[test|else]]'), ...mashup("[[Content|test]]")], []);
	});
	describe('Manual link target -> Exclude in `raw-strip`', () => {
		runComplexCase('test', mashup('[[test|else]]'), mashup("[[Content|test]] b"), ['raw-strip']);
	});
	const ALL_IN_ONE = `\\test
\\whitespace test
\\define test(a)
test
\\end
\\define test2(test) test

<a href="test">contents</a>
<<test>>
{{test}}
{{{test}}}
@@.test
styled
@@
$$$application/test
content
$$$
[img test=test[test]]
[[link|test]]
[[test]]
`;
	describe('Big check -> Include by default', () => {
		runComplexCase('test', ['test', ALL_IN_ONE]);
	});
	describe('Typed blocks -> Exclude in `raw-strip`', () => {
		runComplexCase('test', ['test'], [ALL_IN_ONE], ['raw-strip']);
	});
});
describe('susearch special cases', () => {
	const toTiddlers = titles => titles.map(title => ({ fields: { title: title } }));

	it("Empty source gives empty results", () => {
		const results = runSearch([], '', 'title');
		assert.deepStrictEqual(results, []);
	});
	it("Missing field is treated as no value", () => {
		const results = runSearch(toTiddlers(['c', 'b']), 'test', 'missing field');
		assertResults(results, []);
	});
	it("Missing field with no query still returns results", () => {
		const results = runSearch(toTiddlers(['c', 'b']), '', 'missing field');
		assertResults(results, ['c', 'b']);
	});
});