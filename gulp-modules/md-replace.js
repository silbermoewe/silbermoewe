var es = require('event-stream'),
    $ = require('cheerio'),
    _ = require('lodash');
    Hypher = require('hypher'),
    hypherEn = new Hypher(require('hyphenation.en-us')),
    hypherDe = new Hypher(require('hyphenation.de'));

module.exports = function () {
    return es.map(mdReplace);

    function mdReplace(file, callback) {
        var posts = JSON.parse(file.contents.toString());

        _.each(posts, function (post, name) {
            post.folder = name;
            post.htmlId = post.title.replace(/\s/g, '_');
            replaceImages(post, name);
            splitLanguages(post);
            createPreview(post);
        });

        file.contents = new Buffer(JSON.stringify(sort(posts)));

        callback(null, file);
    }
}

function replaceImages(post, name) {
    var $body = $('<span>' + post.body + '</span>');

    $body.find('img').each(function () {
        $(this)
            .attr('data-src', 'pictures/' + name + '/' + $(this).attr('src'))
            .attr('src', 'img/loading.gif')
    });

    post.body = $body.html();
}

function splitLanguages(post) {
    var languages = post.body.split('<p>---en---</p>\n');
    post.body_de = hyphenate(languages[0], hypherDe);
    post.body_en = hyphenate(languages[1], hypherEn);
}

function hyphenate(string, hyphenator) {
    var $body = $('<span>' + string + '</span>');
    $body.find('p').each(function () {
        _.each(this.childNodes, function (node) {
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
}

function sort(posts) {
    var sortedPosts = _.sortBy(posts, 'date').reverse();

    sortedPosts.forEach(function (post) {
        post.days = Math.round((post.date - _.last(sortedPosts).date) / (1000 * 60 * 60 * 24));
    });

    return sortedPosts;
}
