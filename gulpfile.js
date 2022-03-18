/**
 * Gulp File
 *
 * To compile SCSS: gulp build-css
 * To compile JS: gulp build-js
 * To compile all: gulp build
 * To compile and watch SCSS and JS: gulp watch
 */

var gulp = require('gulp'),
  // sass = require('gulp-sass'),
  // sourcemaps = require('gulp-sourcemaps'),
  autoprefixer = require('gulp-autoprefixer'),
  minifycss = require('gulp-minify-css'),
  minifyjs = require('gulp-minify'),
  uglify = require('gulp-uglify'),
  concat = require('gulp-concat'),
  rename = require('gulp-rename'),
  ngannotate = require('gulp-ng-annotate'),
  closure = require('gulp-jsclosure');

// SCSS/CSS
gulp.task('build-css', function() {
  return gulp
    .src(['./css/portfolio.css', './css/portfolio--mk.css', './css/portfolio--blt.css'])
    .pipe(
      autoprefixer({
        Browserslist: ['last 25 versions']
      })
    )
    .pipe(minifycss())
    .pipe(gulp.dest('./build/css'));
});

// Task: Build JS.
gulp.task('build-js', function() {
  return gulp
    .src([
      './js/app.js',
      './js/provider--config.js',
      './js/config.js',
      './js/factory--image-preloader.js',
      './js/factory--rows.js',
    ])
    .pipe(concat('app-concat.js'))
    .pipe(closure({angular: true}))
    .pipe(ngannotate())
    .pipe(uglify({mangle: false}))
    .pipe(minifyjs())
    .pipe(gulp.dest('./build/js'));
});

// Task: Build both CSS and JS.
gulp.task('build', gulp.series('build-css', 'build-js'));

// Task: Watch both CSS and JS.
gulp.task('watch', function() {
  gulp.watch('./css/**/*.css', gulp.series('build-css'));
  gulp.watch('./js/**/*.js', gulp.series('build-js'));
});

// Task: Default Task.
gulp.task('default', gulp.series('build-css', 'build-js', 'watch'));
