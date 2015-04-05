var _ = require('lodash');

var getImageUrl = require('./get-image-url');
var cache = [];

module.exports = function (image) {
    var url = getImageUrl(image, image.full);

    if (url === image.url) { return; }

    image.url = url;

    var loadIndicator = document.createElement('img');
    loadIndicator.addEventListener('load', setSrc);
    loadIndicator.src = url;

    var cacheIndex = _.findIndex(cache, 'el', image.el);

    if (cacheIndex) {
        _.pullAt(cache, cacheIndex);
    }

    cache.push({
        el: image.el,
        path: image.path
    });

    function setSrc() {
        // make sure this is still the image we want
        if (_.find(cache, 'el', image.el).path !== image.path) {
            return;
        }

        image.el.style.backgroundImage = 'url(' + url + ')';
        image.el.classList.add('is-loaded');
        loadIndicator.removeEventListener('load', setSrc);
    }
};
