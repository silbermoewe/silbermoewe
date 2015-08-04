var LESS = 'src/**/*.less',
    JS = 'src/**/*.js',
    MD = 'posts/**/*.md',
    PICT = 'posts/**/*.jpg',
    IMG = 'img/**/*.*';

var gulp = require('gulp'),
    webpack = require('gulp-webpack'),
    watch = require('gulp-watch'),
    less = require('gulp-less'),
    prefix = require('gulp-autoprefixer'),
    jshint = require('gulp-jshint'),
    concat = require('gulp-concat'),
    handlebars = require('gulp-compile-handlebars'),
    markdown = require('gulp-markdown-to-json'),
    gutil = require('gulp-util'),
    rename = require('gulp-rename'),
    imageResize = require('gulp-image-resize'),
    newer = require('gulp-newer'),
    rsync = require('rsyncwrapper').rsync,
    merge = require('merge-stream'),
    livereload = require('gulp-livereload'),
    _ = require('lodash'),
    fs = require('fs'),
    argv = require('yargs').argv;

var mdReplace = require('./gulp-modules/md-replace');

var webpackConfig = require('./webpack.config.js'),
    webpackDistConfig = require('./webpack.dist.config.js');

gulp.task('js', function () {
    var config = global.isDist ? webpackDistConfig : webpackConfig;
    config.watch = global.isWatching;

    return webpack(config)
        .pipe(gulp.dest('dist'))
        .pipe(livereload());
});

gulp.task('less', function () {

    return gulp.src(LESS)
        .pipe(concat('style.less'))
        .pipe(less().on('error', gutil.log))
        .pipe(prefix('last 2 versions'))
        .pipe(gulp.dest('dist'))
        .pipe(livereload());
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
        .pipe(mdReplace())
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

    return gulp.src('src/**/*.handlebars')
        .pipe(handlebars(posts, options))
        .pipe(rename('index.html'))
        .pipe(gulp.dest('dist'))
        .pipe(livereload());
});

gulp.task('img', function() {
  return gulp.src(IMG)
    .pipe(gulp.dest('dist/img'))
    .pipe(livereload());
});

gulp.task('htaccess', function() {
  return gulp.src('.htaccess')
    .pipe(gulp.dest('dist'));
});

var resizePictures = function (width) {
    return gulp.src(PICT)
        .pipe(rename(function (path) {
            path.basename += '-' + width;
        }))
        .pipe(newer('dist/pictures/'))
        .pipe(imageResize({
            width: width,
            quality: 0.6,
            imageMagick: true
        }))
        .pipe(gulp.dest('dist/pictures/'))
        .pipe(livereload());
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
        dest: 'moewe@indus.uberspace.de:/var/www/virtual/moewe/' + (argv.subdomain || '2014') + '.diesilbermoewe.de',
        recursive: true,
        syncDest: true,
        incremental: true,
        args: ['--verbose']
    }, function(error, stdout, stderr, cmd) {
        gutil.log(stdout);
        callback(error);
    });
});

gulp.task('build', ['jshint', 'js', 'less', 'tpl', 'pict', 'img', 'htaccess']);

gulp.task('dist', function () {
    global.isDist = true;

    gulp.start('build');
});

gulp.task('watch', ['build'], function () {
    livereload.listen();

    global.isWatching = true;

    gulp.start('js');

    watch(LESS, function () {
        gulp.start('less');
    });
    watch(MD, function () {
        gulp.start('tpl');
    });
    watch(JS, function () {
        gulp.start('jshint');
    });
    watch(PICT, function () {
        gulp.start('pict');
    });
    watch(IMG, function () {
        gulp.start('img');
    });
    watch('src/**/*.handlebars', function () {
        gulp.start('tpl');
    });
});
