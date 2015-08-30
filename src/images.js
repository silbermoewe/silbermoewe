const _ = require('lodash');

const elements = require('./elements');
const win = require('./window-dimensions');
const inViewport = require('./in-viewport');
const loadImage = require('./load-image');

const images = elements.images;
const backgrounds = elements.backgrounds;

win.onResize(setPicSrc);
window.addEventListener('scroll', setPicSrc);
setPicSrc();

function setPicSrc() {
    _.each(inViewport(backgrounds, window.pageYOffset, win.height * 4), loadImage);
    _.each(inViewport(images, window.pageYOffset, win.height * 2), loadImage);
}
