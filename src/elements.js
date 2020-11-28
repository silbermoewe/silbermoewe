import _ from 'lodash';

const articles = _.map(document.getElementsByTagName('article'), buildArticlesObject);
const images = _.map(document.getElementsByClassName('image'), buildImageObject);
const backgrounds = _.compact(_.map(articles, buildBackgroundObject));

window.addEventListener('load', updateOffsets);
window.addEventListener('resize', _.debounce(updateOffsets, 20));
document.addEventListener('typekitLoaded', updateOffsets);

export { articles, images, backgrounds, updateOffsets as reCalc };

function buildArticlesObject($article) {
    return {
        el: $article,
        fixed: $article.getElementsByClassName('fixed')[0],
    };
}

function buildImageObject($image) {
    return {
        el: $image,
        path: $image.getAttribute('data-src'),
    };
}

function buildBackgroundObject(article) {
    const $el = article.el.getElementsByClassName('fixed-inner')[0];
    const imageObject = _.assign(
        {
            article: article,
            background: true,
        },
        buildImageObject($el)
    );
    return imageObject.path && imageObject;
}

function updateOffsets() {
    updateArticlesOffsets();
    updateImagesOffsets();
    updateBackgroundOffsets();
}

function updateArticlesOffsets() {
    _.forEach(articles, function (article) {
        article.offset = article.el.offsetTop;
    });
}

function updateImagesOffsets() {
    _.forEach(images, function (image) {
        image.hidden = !image.el.offsetParent;
        image.offset = image.el.offsetParent && image.el.offsetParent.offsetTop + image.el.offsetTop;
    });
}

function updateBackgroundOffsets() {
    _.forEach(backgrounds, function (background) {
        background.offset = background.article.offset;
    });
}
