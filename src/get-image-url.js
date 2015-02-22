var _ = require('lodash');
var win = require('./window-dimensions');
var sizes = [400, 800, 1200, 1600, 2000];

module.exports = getUrl;

function getCurrentSize(full) {
    var width = full ? win.width : (win.width  * 0.375 - 40);
    return _.find(sizes, function (size) {
        return width * window.devicePixelRatio < size;
    }) || _.last(sizes);
}

function getUrl(image, full) {
    return image.path + '-' + getCurrentSize(full) + '.jpg';
}
