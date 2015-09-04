import { forEach, isEqual, debounce } from 'lodash';

import { articles } from './elements';
import inViewport from './in-viewport';
import win from './window-dimensions';

const debouncedCancelMoveNav = debounce(cancelMoveNav, 500);

let lastScrollTop = 0;
let scrolling;

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
    let scrollTop = window.pageYOffset;
    scrollTop = scrollTop < 0 ? 0 : scrollTop;

    if (scrollTop !== lastScrollTop) {
        lastScrollTop = scrollTop;
        moveNav();
    }

    if (!scrolling) { return; }

    window.requestAnimationFrame(onTick);
}

function moveNav() {

    const visible = inViewport(articles, lastScrollTop, win.height);

    forEach(articles, function (article) {
        const isVisible = visible.indexOf(article) !== -1,
            offset = article.offset - lastScrollTop,
            height = win.height - offset,
            clipped = offset > 0;

        const css = {
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
    if (isEqual(article.css, css)) { return; }

    article.css = css;

    forEach(css, function (value, property) {
        article.fixed.style[property] = value;
    });
}

function setFixedInnerHeight() {
    forEach(articles, function (article) {
        article.fixed.children[0].style.height = win.height + 'px';
    });
}

window.addEventListener('scroll', onScroll);
