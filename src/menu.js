import { forEach } from 'lodash';

import win from './window-dimensions';
import { articles } from './elements';

const menuHeight = articles[0].fixed.getElementsByClassName('language-switch')[0].getBoundingClientRect().bottom;

let menuShortened = false;

init();
win.onResize(init);

function init() {
    const shouldShorten = menuHeight > win.height;

    if (shouldShorten === menuShortened) {
        return;
    }

    forEach(articles, function (article) {
        article.fixed.classList.toggle('is-short-menu', shouldShorten);
    });

    menuShortened = shouldShorten;
}
