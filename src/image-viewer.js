var _ = require('lodash');
var images = require('./elements').images;
var loadImage = require('./load-image');

var current;
var $viewer = document.createElement('div');
$viewer.classList.add('image-view');
$viewer.addEventListener('click', hideImageViewer);
document.body.appendChild($viewer);

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
        prepareImage(image);
    });
}

function goToImage(offset) {
    if (!current) { return; }

    var visible = visibleImages();
    var image = visible[visible.indexOf(current) + offset];

    if (!image) { return; }

    prepareImage(image);
}

function prepareImage(image) {
    current = image;
    loadAround(image);

    var newImage = _.clone(image);
    newImage.el = $viewer;
    newImage.full = true;
    $viewer.style.backgroundImage = 'url(' + newImage.url + ')';
    delete newImage.url;
    $viewer.classList.add('is-active');
    document.body.classList.add('no-scroll');
    loadImage(newImage, true);
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
    var visible = visibleImages();
    var index = visible.indexOf(image);

    if (index === -1) { return; }

    [index - 1, index, index + 1].forEach(function (i) {
        if (!visible[i]) { return; }

        loadImage(visible[i]);
    });
}