import { find, last } from 'lodash';
import win from './window-dimensions';

const sizes = [400, 800, 1200, 1600, 2000];
const breakPoints = [
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

export default getUrl;

function getCurrentSize(full) {
    const width = full ? win.width : getContentWidth() - 40;
    return find(sizes, function (size) {
        return width * window.devicePixelRatio < size;
    }) || last(sizes);
}

function getUrl(image) {
    const suffix = image.background ? '' : `-${getCurrentSize(image.full)}.jpg`;
    return image.path + suffix;
}

function getContentWidth() {
    const breakPoint =  find(breakPoints, function (point) {
        return !point.size || point.size > win.width;
    });

    return win.width * breakPoint.ratio;
}
