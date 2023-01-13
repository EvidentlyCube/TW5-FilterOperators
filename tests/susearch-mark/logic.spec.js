/* cSpell:disable */

const assert = require('assert');
const { runComplexCase, runSearch, assertResults } = require('./helpers').helpers;

describe('susearch-mark simple cases', () => {
	it('Mark full phrase', () => {
		runComplexCase('much testing', 'much testing', '<mark>much testing</mark>');
	});
	it('Mark individual words', () => {
		runComplexCase('much testing', 'testing much', '<mark>testing</mark> <mark>much</mark>');
		runComplexCase('much testing', 'too much doing testing here', 'too <mark>much</mark> doing <mark>testing</mark> here');
	});
	it('Mark parts of words', () => {
		runComplexCase('to', 'toad burrito stork', '<mark>to</mark>ad burri<mark>to</mark> s<mark>to</mark>rk');
	});
	it('Mark special characters', () => {
		runComplexCase('$$ @@', '$$ollars mail@@notmail', '<mark>$$</mark>ollars mail<mark>@@</mark>notmail');
	});
	it('Mark normal-special character mix', () => {
		runComplexCase('$ollar$', '$ollar$', '<mark>$ollar$</mark>');
	});
	it('Mark without special characters', () => {
		runComplexCase('$ollar$', 'collars', 'c<mark>ollar</mark>s');
	});
	it('Marking is case-insensitive', () => {
		runComplexCase('TEST', 'test TesT TEST', '<mark>test</mark> <mark>TesT</mark> <mark>TEST</mark>');
	});
});
describe('susearch-mark mode: raw-strip', () => {
	it('Marks everywhere indiscriminately', () => {
		runComplexCase(
			'test',
			"\\define test() test\n"
			 + '<test href="test">test</test>',
			"\\define <mark>test</mark>() <mark>test</mark>\n"
			 + '<<mark>test</mark> href="<mark>test</mark>"><mark>test</mark></<mark>test</mark>>'
		);
	});
});
describe('susearch-mark mode: wikify-strip', () => {
	it('Parse wikitext into html, extract just the text and mark it', () => {
		runComplexCase(
			'test',
			"\\define test() quack test duck\n"
			 + '<test href="test">test</test> __test__ <<test>>',
			 '<mark>test</mark> <mark>test</mark> quack <mark>test</mark> duck',
			 ['wikify-strip']
		);
	})
});
xdescribe('susearch-mark mode: raw-strip', () => {
	const mashup = (text, prefix="a", suffix="b") => {
		const prefixes = ['', "\n", "\r\n", `${prefix}\n`, `${prefix}\r\n`];
		const suffixes = ['', "\n", "\r\n", `\n${suffix}`, `\r\n${suffix}`];
		return prefixes.reduce((all, prefix) => {
			return all.concat(...suffixes.map(suffix => `${prefix}${text}${suffix}`));
		}, [])
	};

	const runFlagged = (name, query, given, expectedNormal, expectedStripped, expectedHtmlified) => {
		it(name, () => {
			runComplexCase(query, given, expectedNormal, [], "Should've marked even wikitext");
			runComplexCase(query, given, expectedStripped, ['raw-strip'], "Should've stripped all wikitext");
			runComplexCase(query, given, expectedStripped, ['html-strip'], "Should've stripped all wikitext");
			runComplexCase(query, given, expectedStripped, ['htmlify'], "Should've marked even wikitext");
			runComplexCase('test', ['test'], mashup('<a href="test">'), ['text-only']);
		});
	}

	xit('HTML Tags', () => {
		runComplexCase('test', ['test', ...mashup('<a href="test">')], [], "");
		runComplexCase('test', ['test'], mashup('<a href="test">'), ['text-only']);
	});
	xit('HTML Tags -> Exclude in `text-only`', () => {
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