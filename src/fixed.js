var $ = require('jquery'),
	_ = require('lodash');

var $articles = $('article'),
	fixedEls = [],
	lastScrollTop = 0,
	windowHeight;

function cacheOffsets() {
	$articles.each(function (index) {
		fixedEls[index].offset = $(this).offset().top;
	});

	windowHeight = $(window).height();

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
	var inViewport = [];

	for (var i = fixedEls.length - 1; i >= 0; i--) {
		if (fixedEls[i].offset < lastScrollTop) {
			inViewport.push(fixedEls[i]);
			break;
		}
		
		if (fixedEls[i].offset < lastScrollTop + windowHeight) {
			inViewport.push(fixedEls[i]);
		}
	}

	inViewport.forEach(function (el) {
		el.fixed.css('transform', 'translate3d(0,' + (lastScrollTop - el.offset) + 'px,0)');
	});
}

function navigate(event) {
	event.preventDefault();

	var id = $(this).attr('href').replace('#', ''),
		offset = _.find(fixedEls, {id: id}).offset,
		time = Math.abs(offset - window.pageYOffset) / 2;

	window.history.pushState(null, '', '#' + id);

	$('html,body').stop().animate({
      scrollTop: offset
    }, time);
}

//init

$articles.each(function (index) {
	fixedEls[index] = {
		article: $(this),
		fixed: $(this).find('.fixed'),
		id: $(this).attr('id')
	};
});

$(window).on('resize', cacheOffsets);
cacheOffsets();

window.requestAnimationFrame(onScroll);

document.addEventListener('typekitLoaded', cacheOffsets);

$('nav').on('click', 'a', navigate);
$('.map').on('click', 'a', navigate);

module.exports = {
	elements: fixedEls,
	reflow: cacheOffsets
};