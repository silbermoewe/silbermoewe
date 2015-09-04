import _ from 'lodash';

import { images, backgrounds } from './elements';
import win from './window-dimensions';
import inViewport from './in-viewport';
import loadImage from './load-image';

win.onResize(setPicSrc);
window.addEventListener('scroll', setPicSrc);
setPicSrc();

function setPicSrc() {
    _.each(inViewport(backgrounds, window.pageYOffset, win.height * 4), loadImage);
    _.each(inViewport(images, window.pageYOffset, win.height * 2), loadImage);
}
