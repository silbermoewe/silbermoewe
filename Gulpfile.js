var LESS = 'src/**/*.less',
    JS = 'src/**/*.js',
    MD = 'posts/**/*.md';

var gulp = require('gulp'),
    less = require('gulp-less'),
    prefix = require('gulp-autoprefixer'),
    jshint = require('gulp-jshint'),
    concat = require('gulp-concat'),
    livereload = require('gulp-livereload'),
    handlebars = require('gulp-compile-handlebars'),
    markdown = require('gulp-markdown-to-json'),
    gutil = require('gulp-util'),
    rename = require('gulp-rename'),
    fs = require('fs');

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

gulp.task('js', ['jshint'], function () {
    return gulp.src(JS)
        .pipe(concat('script.js'))
        .pipe(gulp.dest('dist'));
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

gulp.task('watch', function () {
    var server = livereload();

    gulp.watch(LESS, ['less']);
    gulp.watch(JS, ['js']);

    gulp.watch('dist/**').on('change', function (file) {
        server.changed(file.path);
    });
});

gulp.task('default', ['less', 'js']);
