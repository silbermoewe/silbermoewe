var $ = require('jquery'),
	_ = require('lodash');

module.exports = function () {
	var $articles = $('article'),
		fixedEls = [],
		lastScrollTop = 0;

	$articles.each(function (index) {
		fixedEls[index] = {
			nav: $(this).find('nav'),
			map: $(this).find('.map'),
			id: $(this).attr('id')
		};
	});


	function cacheOffsets() {

		$articles.each(function (index) {
			fixedEls[index].offset = $(this).offset().top;
		});

		moveNav();
	}

	function onScroll() {
		var scrollTop = window.pageYOffset;
		scrollTop = (scrollTop < 0) ? 0 : scrollTop;


		if (scrollTop === lastScrollTop) {
			window.requestAnimationFrame(onScroll);
			return false;
		}

		lastScrollTop = scrollTop;

		moveNav();

		window.requestAnimationFrame(onScroll);		
	}

	function moveNav() {
		fixedEls.forEach(function (els) {
			$([els.nav[0], els.map[0]]).css('transform', 'translate3d(0,' + (lastScrollTop - els.offset) + 'px,0)');
		});
	}

	$(window).on('resize', cacheOffsets);
	cacheOffsets();

	window.requestAnimationFrame(onScroll);

	document.addEventListener('typekitLoaded', cacheOffsets);

	function navigate(event) {
		event.preventDefault();

		var id = $(this).attr('href').replace('#', ''),
			offset = _.find(fixedEls, {id: id}).offset,
			time = Math.abs(offset - window.pageYOffset) / 2;

		$('html,body').stop().animate({
          scrollTop: offset
        }, time);
	}

	$('nav').on('click', 'a', navigate);
	$('.map').on('click', 'a', navigate);

	function setLanguage(language) {
		$('html').attr('lang', language);
		window.localStorage.setItem('language', language);
		cacheOffsets();
	}

	$('.language-switch').on('click', 'span', function () {
		setLanguage($(this).data('lang'));
	});

	setLanguage(window.localStorage.getItem('language') ||
		(window.navigator.language.indexOf('de') !== -1 ? 'de' : 'en'));
};