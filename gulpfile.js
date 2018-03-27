'use strict';

var gulp = require('gulp'),
    gutil = require('gulp-util'),
    sass = require('gulp-sass'),
    plumber = require('gulp-plumber'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    browserSync = require('browser-sync'),
    minifycss = require('gulp-minify-css'),
    autoprefixer = require('gulp-autoprefixer');

var paths = {
    sass: './sass/',
    js: './js/',
    min: './min/'
    // can be used like path.sassPath + '/stylesheets'
}

gulp.task('bs-reload', function () {
  browserSync.reload();
});

gulp.task('browser-sync', function() {
  browserSync({
    server: {
      baseDir: "./"
    }
  });
});

gulp.task('sass', function () {
  return gulp.src(paths.sass + '**/*.scss')
    .pipe(sass().on('error', gutil.log))
    .pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
    }}))
    .pipe(concat('site.css'))
    .pipe(autoprefixer({
      browsers: ['last 3 versions'],
      cascade: false
    }))
    .pipe(gulp.dest(paths.min))
    .pipe(rename({suffix: '.min'}))
    .pipe(minifycss({ keepSpecialComments: 0, processImport: false }))
    .pipe(gulp.dest(paths.min))
    .pipe(browserSync.reload({stream:true}))
});

gulp.task('scripts', function(){
  return gulp.src(paths.js + '*.js')
    .pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
    }}))
    .pipe(concat('main.js'))
    .pipe(gulp.dest(paths.min))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest(paths.min))
    .pipe(browserSync.reload({stream:true}))
});

gulp.task('default', ['browser-sync', 'scripts', 'sass'], function(){
  gulp.watch(paths.sass + '*.scss', ['sass']);
  gulp.watch(paths.js + '*.js', ['scripts']);
  gulp.watch("*.html", ['bs-reload']);
  gulp.watch("*.php", ['bs-reload']);
});
