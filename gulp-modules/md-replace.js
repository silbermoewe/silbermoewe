var es = require('event-stream'),
    $ = require('cheerio'),
    _ = require('lodash'),
    Promise = require('bluebird'),
    Hypher = require('hypher'),
    color = Promise.promisify(require('dominant-color')),
    hypherEn = new Hypher(require('hyphenation.en-us')),
    hypherDe = new Hypher(require('hyphenation.de'));

var config = require('../config.json');

module.exports = function () {
    return es.map(mdReplace);
};

function mdReplace(file, callback) {
    var postsObject = JSON.parse(file.contents.toString());
    var posts = _.map(postsObject, mapPost);

    Promise.resolve(posts)
        .map(handlePost)
        .then(sort)
        .then(function (posts) {
            file.contents = new Buffer(JSON.stringify(posts));
            callback(null, file);
        });
}

function mapPost(post, name) {
    post.backgroundImagePath = post.backgroundImage && '/backgrounds/' + post.backgroundImage;
    post.folder = name;
    post.htmlId = _.deburr(post.title.replace(/\s/g, '_'));
    return post;
}

function handlePost(post) {
    return getDominantColor(post).then(replaceImages).then(splitLanguages).then(createPreview);
}

function getDominantColor(post) {
    return color(config.posts + '/' + post.backgroundImage)
        .then(function (color) {
            post.backgroundColor = '#' + color;
            return post;
        })
        .catch(function () {
            console.log('could not get color from ' + post.backgroundImage);
            return post;
        });
}

function replaceImages(post) {
    var $body = $('<span>' + post.body + '</span>');

    $body.find('img').each(function () {
        var $image = $('<div/>')
            .addClass('image')
            .attr('data-src', 'pictures/' + post.folder + '/' + $(this).attr('src'));

        $(this).parent().before($image);
        $(this).remove();
    });

    $body.find('p').each(function () {
        if ($(this).text().trim().length) {
            return;
        }
        $(this).remove();
    });

    post.body = $body.html();

    return post;
}

function splitLanguages(post) {
    var languages = post.body.split('<p>---en---</p>\n');
    post.body_de = hyphenate(languages[0], hypherDe);
    post.body_en = hyphenate(languages[1], hypherEn);

    return post;
}

function hyphenate(string, hyphenator) {
    var $body = $('<span>' + string + '</span>');
    $body.find('p').each(function () {
        _.forEach(this.childNodes, function (node) {
            if (node.nodeType === 3) {
                node.nodeValue = hyphenator.hyphenateText(node.nodeValue);
            }
        });
    });

    return $body.html();
}

function createPreview(post) {
    var previewContainer = $('<div>' + post.body_en + '</div>').find('p');
    post.preview = previewContainer.eq(0).text() + previewContainer.eq(1).text();

    return post;
}

function sort(posts) {
    var sortedPosts = _.sortBy(posts, 'date').reverse();
    var startKm = _.last(sortedPosts).km;

    sortedPosts.forEach(function (post) {
        post.days = Math.round((post.date - _.last(sortedPosts).date) / (1000 * 60 * 60 * 24));
        post.km = post.km - startKm;
    });

    return sortedPosts;
}
