var _ = require('lodash');
var images = require('./elements').images;
var loadImage = require('./load-image');

var $viewer = document.createElement('div');
$viewer.classList.add('image-view');
$viewer.addEventListener('click', hideImageViewer);
document.body.appendChild($viewer);

document.addEventListener('keydown', function (event) {
    if (event.keyCode !== 27) { return; }

    hideImageViewer();
});

_.each(images, addListener);

function addListener(image) {
    image.el.addEventListener('click', function () {
        prepareImage(image);
    });
}

function prepareImage(image) {
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
    $viewer.classList.remove('is-active');
    document.body.classList.remove('no-scroll');
}