var _ = require('lodash');
var images = require('./elements').images;
var loadImage = require('./load-image');
var win = require('./window-dimensions');
var transform = _.isUndefined(document.body.style.transform) ? 'webkitTransform' : 'transform';

var current;
var gallery;
var $viewer = document.createElement('div');
$viewer.classList.add('image-view');
$viewer.addEventListener('click', hideImageViewer);
document.body.appendChild($viewer);

win.onResize(initImageViewer);
initImageViewer();

document.addEventListener('keydown', function (event) {
    switch (event.keyCode) {
        case 27:
            hideImageViewer();
            break;
        case 37:
            goToImage(-1);
            break;
        case 39:
            goToImage(1);
            break;
    }
});

_.each(images, addListener);

function addListener(image) {
    image.el.addEventListener('click', function () {
        showImage(_.find(gallery, 'trigger', image.el), image.url);
        showImageViewer();
    });
}

function goToImage(offset) {
    if (!current) { return; }

    var image = gallery[gallery.indexOf(current) + offset];

    if (!image) { return; }

    showImage(image);
}

function showImage(image, oldUrl) {
    if (oldUrl) {
        image.url = oldUrl;
        image.el.style.backgroundImage = 'url(' + oldUrl + ')';
    }

    current = image;
    loadImage(image);
    loadAround(image);

    var index = _.findIndex(gallery, image);
    $viewer.style[transform] = 'translateX(-' + index + '00vw)';
}

function initImageViewer(event) {
    if (event) { return; }

    while ($viewer.firstChild) {
        $viewer.removeChild($viewer.firstChild);
    }

    gallery = visibleImages().map(function (image) {
        var newImage = _.clone(image);
        newImage.trigger = image.el;
        newImage.el = document.createElement('div');
        newImage.full = true;
        delete newImage.url;

        $viewer.appendChild(newImage.el);

        return newImage;
    });
}

function showImageViewer() {
    $viewer.classList.add('is-active');
    document.body.classList.add('no-scroll');
}

function hideImageViewer() {
    current = null;
    $viewer.classList.remove('is-active');
    document.body.classList.remove('no-scroll');
}

function visibleImages() {
    return images.filter(function (image) {
        return !image.hidden;
    });
}

function loadAround(image) {
    var index = gallery.indexOf(image);

    if (index === -1) { return; }

    [index - 1, index + 1].forEach(function (i) {
        if (!gallery[i]) { return; }

        loadImage(gallery[i]);
    });
}