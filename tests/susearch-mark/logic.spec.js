const assert = require('assert');
const { runComplexCase, runSearch, assertResults } = require('./helpers').helpers;

global.$tw = {
	utils: {
		escapeRegExp(s) {
			return s.replace(/[\-\/\\\^\$\*\+\?\.\(\)\|\[\]\{\}]/g, '\\$&');
		}
	}
}
describe('susearch-mark simple cases', () => {
	it('Mark full phrase', () => {
		runComplexCase('much testing', 'much testing', '<mark>much testing</mark>');
	});
	xit('Mark individual words', () => {
		runComplexCase('much testing', ['much', 'testing', 'testing is too much'], ['soup']);
	});
	xit('Mark words partially', () => {
		runComplexCase('much testing', ['mucho', 'atesting', 'atestingo is too amucho'], ['soup']);
	});
	xit('Mark words with special characters', () => {
		runComplexCase('$econd$', ['$econd$', 'I have a few $econd$ to spare'], ['soup']);
	});
	xit('Mark words while trimming special characters', () => {
		runComplexCase('$econd$', ['econd', '@econd@'], ['soup']);
	});
	xit('Only special characters will also Mark', () => {
		runComplexCase('$#@', ['$#@', '$#@@#$'], ['$@#']);
	});
	xit('Search is case-insensitive', () => {
		runComplexCase('TEST', ['test', 'TesT', 'TEST'], ['soup']);
	});
});
xdescribe('susearch-mark text-only flag', () => {
	const mashup = (text, prefix="a", suffix="b") => {
		const prefixes = ['', "\n", "\r\n", `${prefix}\n`, `${prefix}\r\n`];
		const suffixes = ['', "\n", "\r\n", `\n${suffix}`, `\r\n${suffix}`];
		return prefixes.reduce((all, prefix) => {
			return all.concat(...suffixes.map(suffix => `${prefix}${text}${suffix}`));
		}, [])
	};

	xit('HTML Tags -> Include by default', () => {
		runComplexCase('test', ['test', ...mashup('<a href="test">')], []);
	});
	xit('HTML Tags -> Exclude in `text-only`', () => {
		runComplexCase('test', ['test'], mashup('<a href="test">'), ['text-only']);
	});
	xit('Macro invocations -> Include by default', () => {
		runComplexCase('test', ['test', ...mashup('<<test>>')], []);
	});
	xit('Macro Invocations -> Exclude in `text-only`', () => {
		runComplexCase('test', ['test'], mashup('<<test>>'), ['text-only']);
	});
	xit('Filter invocations -> Include by default', () => {
		runComplexCase('test', ['test', ...mashup('{{{test}}}')], []);
	});
	xit('Filter Invocations -> Exclude in `text-only`', () => {
		runComplexCase('test', ['test'], mashup('{{{test}}}'), ['text-only']);
	});
	xit('Transclusions -> Include by default', () => {
		runComplexCase('test', ['test', ...mashup('{{test}}')], []);
	});
	xit('Transclusions -> Exclude in `text-only`', () => {
		runComplexCase('test', ['test'], mashup('{{test}}'), ['text-only']);
	});
	xit('Images -> Include by default', () => {
		runComplexCase('test', ['test', ...mashup('[img class="test" [test.jpg]]')], []);
	});
	xit('Images -> Exclude in `text-only`', () => {
		runComplexCase('test', ['test'], mashup('[img class="test" [test.jpg]]'), ['text-only']);
	});
	const MACRO_DEF_MULTILINE_N = "\\define a(a b c)\ntest\n\\end";
	const MACRO_DEF_MULTILINE_RN = "\\define bbb(a b c)\r\ntest\r\n\\end";
	const MACRO_DEF_SINGLELINE1 = "\\define ccccc(a b c) test";
	xit('Macro Definitions -> Include by default', () => {
		runComplexCase('test', [
			...mashup(MACRO_DEF_MULTILINE_N),
			...mashup(MACRO_DEF_MULTILINE_RN),
			...mashup(MACRO_DEF_SINGLELINE1),
			"test"
		]);
	});
	xit('Macro Definitions -> Exclude in `text-only`', () => {
		runComplexCase('test',
			['test'], [
				...mashup(MACRO_DEF_MULTILINE_N),
				...mashup(MACRO_DEF_MULTILINE_RN),
				...mashup(MACRO_DEF_SINGLELINE1),
		], ['text-only']);
	});
	xit('Arbitrary Pragmas at the start -> Include by default', () => {
		runComplexCase('test', ['test', ...mashup("\\test", "\n  \r\n")], []);
	});
	xit('Arbitrary Pragmas at the start -> Exclude in `text-only`', () => {
		runComplexCase('test', ['test'], mashup("\\test", "\n  \r\n"), ['text-only']);
	});
	xit('Styles -> Include by default', () => {
		runComplexCase('test', ['test', ...mashup("@@.test")], []);
	});
	xit('Styles -> Exclude in `text-only`', () => {
		runComplexCase('test', ['test'], mashup("@@.test"), ['text-only']);
	});
	xit('Typed blocks -> Include by default', () => {
		runComplexCase('test', ["test",...mashup("$$$application/test")]);
	});
	xit('Typed blocks -> Exclude in `text-only`', () => {
		runComplexCase('test', ["test"], mashup("$$$application/test"), ['text-only']);
	});
	xit('Manual link target -> Include by default', () => {
		runComplexCase('test', [...mashup('[[test|else]]'), ...mashup("[[Content|test]]")], []);
	});
	xit('Manual link target -> Exclude in `text-only`', () => {
		runComplexCase('test', mashup('[[test|else]]'), mashup("[[Content|test]] b"), ['text-only']);
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
	xit('Big check -> Include by default', () => {
		runComplexCase('test', ['test', ALL_IN_ONE]);
	});
	xit('Typed blocks -> Exclude in `text-only`', () => {
		runComplexCase('test', ['test'], [ALL_IN_ONE], ['text-only']);
	});
});
describe('susearch-mark special cases', () => {
	const toTiddlers = titles => titles.map(title => ({ fields: { title: title } }));
	xit('Empty query makes no changes', () => {
		runComplexCase('', ['', 'test', '    '], ['', 'test', '    ']);
	})
	xit("Empty source gives empty results", () => {
		const results = runSearch([], '', 'title');
		assert.deepStrictEqual(results, []);
	});
	xit("Missing field is treated as no value", () => {
		const results = runSearch(toTiddlers(['c', 'b']), 'test', 'missing field');
		assertResults(results, []);
	});
	xit("Missing field with no query still returns results", () => {
		const results = runSearch(toTiddlers(['c', 'b']), '', 'missing field');
		assertResults(results, ['c', 'b']);
	});
});