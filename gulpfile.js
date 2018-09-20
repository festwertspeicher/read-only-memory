'use strict';

var gulp = require('gulp'),
    sass = require('gulp-sass'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    cleanCSS = require('gulp-clean-css'),
    browserSync = require('browser-sync'),
    plumber = require('gulp-plumber'),
    notify = require("gulp-notify"),
    autoprefixer = require('gulp-autoprefixer');

var reportError = function (error) { // advanced error handling from Brendan Falkowski
    notify({
        title: 'Gulp Task Error',
        message: 'Check the console.'
    }).write(error);

    console.log(error.toString());

    this.emit('end');
}

var paths = {
  url: 'http://127.0.0.1/read-only-memory',  //localhost
  sass: './sass/',
  js: './js/',
  min: './min/'
  // can be used like path.theme_src + '/stylesheets'
}


/* Prepare Browser-sync for localhost */
gulp.task('browser-sync', function() {
  browserSync({
    server: {
      baseDir: "./"
    }
  });
});

gulp.task('bs-reload', function () {
  browserSync.reload();
});


gulp.task('sass', function(){
  return gulp.src(paths.sass + '**/*.scss')
    .pipe(sass())
    .pipe(plumber({
        errorHandler: reportError
    }))
    .pipe(concat('site.css'))
    .pipe(autoprefixer({
      browsers: ['last 3 versions'],
      cascade: false
    }))
    .pipe(gulp.dest(paths.min))
    .pipe(rename({suffix: '.min'}))
    .pipe(cleanCSS({specialComments: 0}))
    .pipe(gulp.dest(paths.min))
    .pipe(browserSync.reload({stream:true}))
    .on('error', reportError)

});

gulp.task('scripts', function(){
  return gulp.src(paths.js + '**/*.js')
    .pipe(plumber({
        errorHandler: reportError
    }))
    .pipe(concat('main.js'))
    .pipe(gulp.dest(paths.min))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest(paths.min))
    .pipe(browserSync.reload({stream:true}))
    .on('error', reportError)
});


/* Watch scss, js and html files, doing different things with each. */
gulp.task('default', ['sass', 'scripts', 'browser-sync'], function () {
  gulp.watch(paths.sass + '*.scss', ['sass']);
  gulp.watch(paths.js + '*.js', ['scripts']);
  gulp.watch("*.html", ['bs-reload']);
  gulp.watch("*.php", ['bs-reload']);
});
