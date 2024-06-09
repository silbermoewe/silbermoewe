const es = require('event-stream');
const $ = require('cheerio');
const _ = require('lodash');
const Hypher = require('hypher');
const { promisify } = require('util');
const dominantColor = promisify(require('dominant-color'));
const hypherEn = new Hypher(require('hyphenation.en-us'));
const hypherDe = new Hypher(require('hyphenation.de'));

const config = require('../config.json');

module.exports = function () {
    return es.map(mdReplace);
};

function mdReplace(file, callback) {
    const postsObject = JSON.parse(file.contents.toString());

    Promise.all(_.map(postsObject, mapPost).map(handlePost))
        .then(sort)
        .then(posts => {
            file.contents = Buffer.from(JSON.stringify(posts));
            callback(null, file);
        });
}

function mapPost(post, name) {
    return {
        ...post,
        backgroundImagePath: post.backgroundImage && '/backgrounds/' + post.backgroundImage,
        folder: name,
        htmlId: _.deburr(post.title.replace(/\s/g, '_')),
    };
}

function handlePost(post) {
    return getDominantColor(post).then(replaceImages).then(splitLanguages).then(createPreview);
}

function getDominantColor(post) {
    return dominantColor(config.posts + '/' + post.backgroundImage)
        .then(color => ({ ...post, backgroundColor: '#' + color }))
        .catch(() => {
            console.log(`could not get color from ${post.backgroundImage} for ${post.title}`);
            return post;
        });
}

function replaceImages(post) {
    const $body = $('<span>' + post.body + '</span>');

    $body.find('img').each(function () {
        const $image = $('<div/>')
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

    return { ...post, body: $body.html() };
}

function splitLanguages(post) {
    const [deBody, enBody] = post.body.split('<p>---en---</p>\n');
    return { ...post, body_de: hyphenate(deBody, hypherDe), body_en: hyphenate(enBody, hypherEn) };
}

function hyphenate(string, hyphenator) {
    const $body = $('<span>' + string + '</span>');
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
    const previewContainer = $('<div>' + post.body_en + '</div>').find('p');
    post.preview = previewContainer.eq(0).text() + previewContainer.eq(1).text();

    return post;
}

function sort(posts) {
    const sortedPosts = _.sortBy(posts, 'date').reverse();
    const startKm = _.last(sortedPosts).km;

    return sortedPosts.map(post => ({
        ...post,
        days: Math.round((post.date - _.last(sortedPosts).date) / (1000 * 60 * 60 * 24)),
        km: post.km - startKm,
    }));
}
