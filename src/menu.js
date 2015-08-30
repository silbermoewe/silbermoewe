var _ = require('lodash');
var win = require('./window-dimensions');
var articles = require('./elements').articles;

var menuHeight = articles[0]
    .fixed
    .getElementsByClassName('language-switch')[0]
    .getBoundingClientRect()
    .bottom;
var menuShortened = false;

init();
win.onResize(init);

function init() {
    var shouldShorten = menuHeight > win.height;

    if (shouldShorten === menuShortened) { return; }

    _.each(articles, function (article) {
        article.fixed.classList.toggle('is-short-menu', shouldShorten);
    });

    menuShortened = shouldShorten;
}
