var $ = require('jquery');

var fixed = require('./fixed');

function setLanguage(language) {
	$('html').attr('lang', language);
	window.localStorage.setItem('language', language);
	fixed.reflow();
}

// init

setLanguage(window.localStorage.getItem('language') ||
	(window.navigator.language.indexOf('de') !== -1 ? 'de' : 'en'));

$('.language-switch').on('click', 'span', function () {
	setLanguage($(this).data('lang'));
});