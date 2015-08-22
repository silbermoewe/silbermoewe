var _ = require('lodash');
var win = require('./window-dimensions');
var sizes = [400, 800, 1200, 1600, 2000];
var breakPoints = [
    {
        size: 600,
        ratio: 1
    },
    {
        size: 900,
        ratio: 0.75
    },
    {
        ratio: 0.375
    }
];

module.exports = getUrl;

function getCurrentSize(full) {
    var width = full ? win.width : (getContentWidth() - 40);
    return _.find(sizes, function (size) {
        return width * window.devicePixelRatio < size;
    }) || _.last(sizes);
}

function getUrl(image) {
    var suffix = image.background ? '' : ('-' + getCurrentSize(image.full) + '.jpg');
    return image.path + suffix;
}

function getContentWidth() {
    var breakPoint =  _.find(breakPoints, function (breakPoint) {
        return !breakPoint.size || breakPoint.size > win.width;
    });

    return win.width * breakPoint.ratio;
}
