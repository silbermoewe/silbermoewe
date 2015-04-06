var _ = require('lodash');

var getImageUrl = require('./get-image-url');

module.exports = function (image) {
    var url = getImageUrl(image, image.full);

    if (url === image.url) { return; }

    image.url = url;

    var loadIndicator = document.createElement('img');
    loadIndicator.addEventListener('load', setSrc);
    loadIndicator.src = url;

    function setSrc() {
        image.el.style.backgroundImage = 'url(' + url + ')';
        image.el.classList.add('is-loaded');
        loadIndicator.removeEventListener('load', setSrc);
    }
};
