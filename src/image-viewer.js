var _ = require('lodash');
var images = require('./elements').images;
var loadImage = require('./load-image');
var win = require('./window-dimensions');
var transform = _.isUndefined(document.body.style.transform) ? 'webkitTransform' : 'transform';

var current;
var gallery;
var $viewer = document.createElement('div');
var touch = require('./touch')($viewer);

$viewer.classList.add('image-view');
$viewer.addEventListener('click', hideImageViewer);
document.body.appendChild($viewer);

win.onResize(initImageViewer);
initImageViewer();

touch.on('move', touchMoveHandler);
touch.on('end', touchEndHandler);

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

function touchMoveHandler(distance) {
    $viewer.classList.remove('is-animating');

    setViewerCss(convertToVw(distance));
}

function touchEndHandler(distance) {
    $viewer.classList.add('is-animating');

    var vw = convertToVw(distance);

    if (vw > 20) {
        goToImage(1);
    } else if (vw < -20) {
        goToImage(-1);
    } else {
        goToImage(0);
    }
}

function convertToVw(distance) {
    return distance / win.width * 100;
}

function setViewerCss(offset) {
    var vw = _.findIndex(gallery, current) * -100 - (offset ? offset : 0);

    if (vw > 0 || vw < (gallery.length - 1) * -100) { return; }

    $viewer.style[transform] = 'translateX(' + vw + 'vw)';
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

    setViewerCss();
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
        newImage.el.classList.add('image');
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
    $viewer.classList.remove('is-active', 'is-animating');
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
