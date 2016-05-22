import _ from 'lodash';

import { images, backgrounds } from './elements';
import win from './window-dimensions';
import inViewport from './in-viewport';
import loadImage from './load-image';

win.onResize(setPicSrc);
window.addEventListener('scroll', setPicSrc);
setPicSrc();

function setPicSrc() {
    _.forEach(inViewport(backgrounds, window.pageYOffset, win.height * 4), loadImage);
    _.forEach(inViewport(images, window.pageYOffset, win.height * 2), loadImage);
}
