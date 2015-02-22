var _ = require('lodash');

var articles = _.map(document.getElementsByTagName('article'), buildArticlesObject);
var images = _.map(document.getElementsByClassName('image'), buildImageObject);

window.addEventListener('load', updateOffsets);
window.addEventListener('resize', _.debounce(updateOffsets, 20));
document.addEventListener('typekitLoaded', updateOffsets);

module.exports = {
    articles: articles,
    images: images,
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

function updateOffsets() {
    updateArticlesOffsets();
    updateImagesOffsets();
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
