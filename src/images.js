var _ = require('lodash');

var images = require('./elements').images;
var win = require('./window-dimensions');
var inViewport = require('./in-viewport');
var loadImage = require('./load-image');

win.onResize(setPicSrc);
window.addEventListener('scroll', setPicSrc);
setPicSrc();

function setPicSrc() {
	_.each(inViewport(images, window.pageYOffset, win.height * 2), loadImage);
}
