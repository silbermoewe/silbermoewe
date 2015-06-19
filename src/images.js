var _ = require('lodash');

var elements = require('./elements');
var win = require('./window-dimensions');
var inViewport = require('./in-viewport');
var loadImage = require('./load-image');

var images = elements.images;
var backgrounds = elements.backgrounds;

win.onResize(setPicSrc);
window.addEventListener('scroll', setPicSrc);
setPicSrc();

function setPicSrc() {
    _.each(inViewport(backgrounds, window.pageYOffset, win.height * 4), loadImage);
    _.each(inViewport(images, window.pageYOffset, win.height * 2), loadImage);
}
