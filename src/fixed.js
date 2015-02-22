var _ = require('lodash');

var articles = require('./elements').articles;
var inViewport = require('./in-viewport');
var win = require('./window-dimensions');

var lastScrollTop = 0,
	scrolling,
	debouncedCancelMoveNav = _.debounce(cancelMoveNav, 500),
	transform = _.isUndefined(document.body.style.transform) ? 'webkitTransform' : 'transform';

win.onResize(moveNav);

function onScroll() {
	debouncedCancelMoveNav();

	if (scrolling) { return; }

	onTick();
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
	_.each(inViewport(articles, lastScrollTop, win.height), function (article) {
		article.fixed.style[transform] = 'translate3d(0,' + (lastScrollTop - article.offset) + 'px,0)';
	});
}

function cancelMoveNav() {
	scrolling = false;
}

window.addEventListener('scroll', onScroll);

module.exports = {
	reflow: _.noop
};
