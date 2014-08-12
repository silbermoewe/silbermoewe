var LESS = 'src/**/*.less',
    JS = 'src/**/*.js',
    MD = 'posts/**/*.md',
    PICT = 'posts/**/*.jpg',
    IMG = 'img/**/*.*'

var gulp = require('gulp'),
    less = require('gulp-less'),
    prefix = require('gulp-autoprefixer'),
    jshint = require('gulp-jshint'),
    concat = require('gulp-concat'),
    handlebars = require('gulp-compile-handlebars'),
    markdown = require('gulp-markdown-to-json'),
    browserSync = require('browser-sync'),
    gutil = require('gulp-util'),
    rename = require('gulp-rename'),
    browserify = require('browserify'),
    watchify = require('watchify'),
    source = require('vinyl-source-stream'),
    streamify = require('gulp-streamify'),
    uglify = require('gulp-uglify'),
    imageResize = require('gulp-image-resize'),
    changed = require('gulp-changed'),
    rsync = require('rsyncwrapper').rsync,
    merge = require('merge-stream'),
    _ = require('lodash'),
    jsdom = require("jsdom"), 
    $ = require("jquery")(jsdom.jsdom().createWindow()),
    fs = require('fs');

gulp.task('browserify', function () {

    var bundler = browserify('./src/app.js', watchify.args);

    var bundle = function() {
        return bundler
            .bundle()
            .on('error', function (err) {
                gutil.log('Browserify Error', err);
            })
            .pipe(source('app.js'))
            .pipe(global.isDist ? streamify(uglify()) : gutil.noop())
            .pipe(gulp.dest('./dist'));
    };

    if (global.isWatching) {
        bundler = watchify(bundler);
        bundler.on('update', bundle);
    }

    bundler.transform('brfs');

    return bundle();
});

gulp.task('less', function () {

    return gulp.src(LESS)
        .pipe(concat('style.less'))
        .pipe(less().on('error', gutil.log))
        .pipe(prefix('last 2 versions'))
        .pipe(gulp.dest('dist'));
});

gulp.task('jshint', function () {
    return gulp.src(JS)
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('md', function () {
    return gulp.src(MD)
        .pipe(gutil.buffer())
        .pipe(markdown('blog.json'))
        .pipe(gulp.dest('tmp'));
});

gulp.task('tpl', ['md'], function () {
    var posts = JSON.parse(fs.readFileSync('./tmp/blog.json')),
        options = {
            helpers: {
                same: function (a, b, opts) {
                    if (a === b) {
                        return opts.fn(this);
                    } else {
                        return opts.inverse(this);
                    }
                }
            }
        };

    _.each(posts, function (post, name) {
        post.body = post.body.replace(new RegExp('img src="', 'g'), 'img src="img/loading.gif" data-src="pictures/' + name + '/');
        var languages = post.body.split('<p>---en---</p>\n');
        post.body_de = languages[0];
        post.body_en = languages[1];
        post.folder = name;
        post.preview = $('<div>' + post.body_en + '</div>').find('p:first').text();
    });

    posts = _.sortBy(posts, 'date').reverse();

    posts.forEach(function (post) {
        post.days = Math.round((post.date - _.last(posts).date) / (1000 * 60 * 60 * 24));
    });

    return gulp.src('src/**/*.handlebars')
        .pipe(handlebars(posts, options))
        .pipe(rename('index.html'))
        .pipe(gulp.dest('dist'));
});

gulp.task('img', function() {
  return gulp.src(IMG)
    .pipe(gulp.dest('dist/img'));
});

gulp.task('htaccess', function() {
  return gulp.src('.htaccess')
    .pipe(gulp.dest('dist'));
});

var resizePictures = function (width) {
    return gulp.src(PICT)
        .pipe(changed('dist/pictures/'))
        .pipe(imageResize({
            width: width,
            quality: 0.6,
            imageMagick: true
        }))
        .pipe(rename(function (path) {
            path.basename += '-' + width;
        }))
        .pipe(gulp.dest('dist/pictures/'));
};

gulp.task('pict', function () {
    var stream = merge();

    [400, 800, 1200, 1600, 2000].forEach(function (size) {
        stream.add(resizePictures(size));
    });

    return stream;
});

gulp.task('deploy', function (callback) {
    rsync({
        ssh: true,
        src: './dist/',
        dest: 'moewe@indus.uberspace.de:/home/moewe/html/',
        recursive: true,
        syncDest: true,
        args: ['--verbose']
    }, function(error, stdout, stderr, cmd) {
        gutil.log(stdout);
        callback(error);
    });
});

gulp.task('build', ['jshint', 'browserify', 'less', 'tpl', 'pict', 'img', 'htaccess']);

gulp.task('dist', function () {
    global.isDist = true;

    gulp.start('build');
});

gulp.task('watch', ['build'], function () {
    browserSync.init(['dist/**'], {
        server: {
            baseDir: 'dist'
        }
    });

    global.isWatching = true;

    gulp.start('browserify');

    gulp.watch(LESS, ['less']);
    gulp.watch(MD, ['tpl']);
    gulp.watch(JS, ['jshint']);
    gulp.watch(PICT, ['pict']);
    gulp.watch(IMG, ['img']);
    gulp.watch('src/**/*.handlebars', ['tpl']);
});
