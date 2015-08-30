var gulp = require('gulp'),
    webpack = require('gulp-webpack'),
    watch = require('gulp-watch'),
    less = require('gulp-less'),
    prefix = require('gulp-autoprefixer'),
    eslint = require('gulp-eslint'),
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

var mdReplace = require('./gulp-modules/md-replace'),
    config = require('./config.json');

var webpackConfig = require('./webpack.config.js'),
    webpackDistConfig = require('./webpack.dist.config.js');

var src = {
    less: 'src/**/*.less',
    js: 'src/**/*.js',
    md: config.posts + '/**/*.md',
    pict: config.posts + '/*/*.jpg',
    backgrounds: config.posts + '/*.jpg',
    static: 'static/**/*'
}

gulp.task('js', function () {
    var config = global.isDist ? webpackDistConfig : webpackConfig;
    config.watch = global.isWatching;

    return webpack(config)
        .pipe(gulp.dest('dist'))
        .pipe(livereload());
});

gulp.task('less', function () {

    return gulp.src(src.less)
        .pipe(concat('style.less'))
        .pipe(less().on('error', gutil.log))
        .pipe(prefix('last 2 versions'))
        .pipe(gulp.dest('dist'))
        .pipe(livereload());
});

gulp.task('eslint', function () {
    return gulp.src(src.js)
        .pipe(eslint())
        .pipe(eslint.format());
});

gulp.task('md', function () {
    return gulp.src(src.md)
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

gulp.task('backgrounds', function() {
  return gulp.src(src.backgrounds)
    .pipe(gulp.dest('dist/backgrounds'))
    .pipe(livereload());
});

gulp.task('static', function() {
  return gulp.src(src.static, { dot: true })
    .pipe(gulp.dest('dist'));
});

var resizePictures = function (width) {
    return gulp.src(src.pict)
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
        dest: 'moewe@indus.uberspace.de:/var/www/virtual/moewe/' + (argv.subdomain || config.year) + '.diesilbermoewe.de',
        recursive: true,
        syncDest: true,
        incremental: true,
        args: ['--verbose']
    }, function(error, stdout, stderr, cmd) {
        gutil.log(stdout);
        callback(error);
    });
});

gulp.task('build', ['eslint', 'js', 'less', 'tpl', 'pict', 'backgrounds', 'static']);

gulp.task('dist', function () {
    global.isDist = true;

    gulp.start('build');
});

gulp.task('watch', ['build'], function () {
    livereload.listen();

    global.isWatching = true;

    gulp.start('js');

    watch(src.less, function () {
        gulp.start('less');
    });
    watch(src.md, function () {
        gulp.start('tpl');
    });
    watch(src.js, function () {
        gulp.start('eslint');
    });
    watch(src.pict, function () {
        gulp.start('pict');
    });
    watch(src.backgrounds, function () {
        gulp.start('backgrounds');
    });
    watch('src/**/*.handlebars', function () {
        gulp.start('tpl');
    });
});
