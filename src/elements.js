var _ = require('lodash');

var articles = _.map(document.getElementsByTagName('article'), buildArticlesObject);
var images = _.map(document.getElementsByClassName('image'), buildImageObject);
var backgrounds = _.map(articles, buildBackgroundObject);

window.addEventListener('load', updateOffsets);
window.addEventListener('resize', _.debounce(updateOffsets, 20));
document.addEventListener('typekitLoaded', updateOffsets);

module.exports = {
    articles: articles,
    images: images,
    backgrounds: backgrounds,
    reCalc: updateOffsets
};

function buildArticlesObject($article) {
    return {
        el: $article,
        fixed: $article.getElementsByClassName('fixed')[0]
    };
}

function buildImageObject($image) {
    return {
        el: $image,
        path: $image.getAttribute('data-src')
    };
}

function buildBackgroundObject(article) {
    var $el = article.el.getElementsByClassName('fixed-inner')[0];
    return _.assign({
        article: article,
        background: true
    }, buildImageObject($el));
}

function updateOffsets() {
    updateArticlesOffsets();
    updateImagesOffsets();
    updateBackgroundOffsets();
}

function updateArticlesOffsets() {
    _.each(articles, function (article) {
        article.offset = article.el.offsetTop;
    });
}

function updateImagesOffsets() {
    _.each(images, function (image) {
        image.hidden = !image.el.offsetParent;
        image.offset = image.el.offsetParent &&
            image.el.offsetParent.offsetTop + image.el.offsetTop;
    });
}

function updateBackgroundOffsets() {
    _.each(backgrounds, function (background) {
        background.offset = background.article.offset;
    });
}
