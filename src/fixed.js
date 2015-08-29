var _ = require('lodash');

var articles = require('./elements').articles;
var inViewport = require('./in-viewport');
var win = require('./window-dimensions');

var lastScrollTop = 0,
    scrolling,
    debouncedCancelMoveNav = _.debounce(cancelMoveNav, 500);

startAnimation();
win.onResize(moveNav);
win.onResize(setFixedInnerHeight);

function onScroll() {
    debouncedCancelMoveNav();

    if (scrolling) { return; }

    scrolling = true;
    startAnimation();
}

function startAnimation() {
    window.requestAnimationFrame(onTick);
}

function onTick() {
    var scrollTop = window.pageYOffset;
    scrollTop = (scrollTop < 0) ? 0 : scrollTop;

    if (scrollTop !== lastScrollTop) {
        lastScrollTop = scrollTop;
        moveNav();
    }

    if (!scrolling) { return; }

    window.requestAnimationFrame(onTick);
}

function moveNav() {

    var visible = inViewport(articles, lastScrollTop, win.height);

    _.each(articles, function (article) {
        var isVisible = visible.indexOf(article) !== -1,
            offset = article.offset - lastScrollTop,
            height = win.height - offset,
            clipped = offset > 0;

        var css = {
            visibility: isVisible ? 'visible' : 'hidden',
            height: clipped ? height + 'px' : '',
            top: clipped ? 'auto' : ''
        };

        applyCss(article, css);
    });
}

function cancelMoveNav() {
    scrolling = false;
}

function applyCss(article, css) {
    if (_.isEqual(article.css, css)) { return; }

    article.css = css;

    _.each(css, function (value, property) {
        article.fixed.style[property] = value;
    });
}

function setFixedInnerHeight() {
    _.each(articles, function (article) {
        article.fixed.children[0].style.height = win.height + 'px';
    });
}

window.addEventListener('scroll', onScroll);
