/*\
title: $:/plugins/EvidentlyCube/ExtraOperators/common.js
type: application/javascript
module-type: filteroperator

Smart sorting of search results

\*/
(function(){

	/*jslint node: true, browser: true */
	/*global $tw: false */
	"use strict";

	exports.TEXT_ONLY_REGEXPS = [
		[/\\define\s+([^(\s]+)\([^\)]*\)(\r?\n(\s|\S)*?\end|.+?(\r?\n|$))/ig, ''], // Macro definitions
		[/\s*\\(?:\s|\S)+?\n([^\\\r\n])/ig, '$1'], // Arbitrary pragmas at the start
		[/\[img[^\]]*\]\]/ig, ''], // Images
		[/^@@.*?(\r?\n|$)/igm, ''], // Styles
		[/^\$\$\$.*?(\r?\n|$)/igm, ''], // Typed block
		[/\{\{\{[^\}]*\}\}\}/ig, ''], // Filter invocations
		[/\{\{[^\}]*\}\}/ig, ''], // Transclusions
		[/\[\[([^\]]+(?=\|))?\|?[^\]]+\]\]/ig, '$1'], // Links
		[/<<[^>]*>>/ig, ''], // Macro invocations
		[/<\/?[^>]*>/ig, ''] // HTML Tags
	];

})();
