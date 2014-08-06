var LESS = 'src/**/*.less',
    JS = 'src/**/*.js',
    MD = 'posts/**/*.md';

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
            .pipe(gulp.dest('./dist'));
    };

    if (global.isWatching) {
        bundler = watchify(bundler);
        bundler.on('update', bundle);
    }

    return bundle();
});

gulp.task('less', function () {

    return gulp.src(LESS)
        .pipe(concat('style.less'))
        .pipe(less())
        .pipe(prefix('last 2 versions'))
        .pipe(gulp.dest('dist'));
});

gulp.task('jshint', function () {
    return gulp.src(JS)
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('md', function () {
    gulp.src(MD)
        .pipe(gutil.buffer())
        .pipe(markdown('blog.json'))
        .pipe(gulp.dest('tmp'));
});

gulp.task('tpl', ['md'], function () {
    var posts = JSON.parse(fs.readFileSync('./tmp/blog.json'));

    return gulp.src('src/**/*.handlebars')
        .pipe(handlebars(posts))
        .pipe(rename('index.html'))
        .pipe(gulp.dest('dist'));
});

gulp.task('build', ['jshint', 'browserify', 'less', 'tpl']);

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
});
