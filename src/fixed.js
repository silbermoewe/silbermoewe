var $ = require('jquery'),
	_ = require('lodash');

var $articles = $('article'),
	fixedEls = [],
	lastScrollTop = 0,
	scrolling,
	debouncedCancelMoveNav = _.debounce(cancelMoveNav, 500),
	transform = _.isUndefined(document.body.style.transform) ? 'webkitTransform' : 'transform',
	windowHeight;

function cacheOffsets() {
	$articles.each(function (index) {
		fixedEls[index].offset = $(this).offset().top;
	});

	windowHeight = $(window).height();

	moveNav();
}

function onScroll() {
	debouncedCancelMoveNav();

	if (scrolling) { return; }

	onTick();
}

function cancelMoveNav() {
	scrolling = false;
}

function onTick() {
	var scrollTop = window.pageYOffset;
	scrollTop = (scrollTop < 0) ? 0 : scrollTop;

	if (scrollTop === lastScrollTop) {
		return false;
	}

	lastScrollTop = scrollTop;

	moveNav();

	if (!scrolling) { return; }

	window.requestAnimationFrame(onTick);
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
		el.fixed[0].style[transform] = 'translate3d(0,' + (lastScrollTop - el.offset) + 'px,0)';
	});
}

// init

$articles.each(function (index) {
	fixedEls[index] = {
		article: $(this),
		fixed: $(this).find('.fixed'),
		id: $(this).attr('id')
	};
});

$(window).on('resize', cacheOffsets);
cacheOffsets();

$(window).on('scroll', onScroll);

document.addEventListener('typekitLoaded', cacheOffsets);

module.exports = {
	elements: fixedEls,
	reflow: cacheOffsets
};
