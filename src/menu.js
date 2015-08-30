const _ = require('lodash');
const win = require('./window-dimensions');
const articles = require('./elements').articles;

const menuHeight = articles[0]
    .fixed
    .getElementsByClassName('language-switch')[0]
    .getBoundingClientRect()
    .bottom;

let menuShortened = false;

init();
win.onResize(init);

function init() {
    const shouldShorten = menuHeight > win.height;

    if (shouldShorten === menuShortened) { return; }

    _.each(articles, function (article) {
        article.fixed.classList.toggle('is-short-menu', shouldShorten);
    });

    menuShortened = shouldShorten;
}
