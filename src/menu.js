var MENU_TOP_PADDING = 120;

var _ = require('lodash');
var win = require('./window-dimensions');
var articles = require('./elements').articles;

var menuHeight = articles[0]
    .fixed
    .getElementsByTagName('nav')[0]
    .getElementsByTagName('ul')[0]
    .offsetHeight;
var menuShortened = false;

init();
win.onResize(init);

function init() {
    var shouldShorten = (menuHeight + MENU_TOP_PADDING) > win.height;

    if (shouldShorten === menuShortened) { return; }

    _.each(articles, function (article) {
        article.fixed.classList.toggle('is-short-menu', shouldShorten);
    });

    menuShortened = shouldShorten;
}