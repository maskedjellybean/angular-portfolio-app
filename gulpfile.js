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
  // gulp.src('./css/portfolio.css')
  //   // .pipe(sourcemaps.init())
  //   // .pipe(sass({
  //   //   includePaths: ['./node_modules/foundation-sites/scss']
  //   // }).on('error', sass.logError))
  //   .pipe(autoprefixer({
  //     browsers: ['last 25 versions']
  //   }))
  //   .pipe(minifycss())
  //   .pipe(rename({suffix: '.min'}))
  //   // .pipe(sourcemaps.write('.'))
  //   .pipe(gulp.dest('./build/css'));

  gulp.src(['./css/portfolio.css', './css/portfolio--mk.css'])
    .pipe(autoprefixer({
      browsers: ['last 25 versions']
    }))
    .pipe(minifycss())
    .pipe(concat('portfolio--mk.min.css'))
    .pipe(gulp.dest('./build/css'));

  gulp.src(['./css/portfolio.css', './css/portfolio--blt.css'])
    .pipe(autoprefixer({
      browsers: ['last 25 versions']
    }))
    .pipe(minifycss())
    .pipe(concat('portfolio--blt.min.css'))
    .pipe(gulp.dest('./build/css'));
});

// JS
var jspaths = [
  './js/app.js',
  './js/provider--config.js',
  './js/config.js',
  './js/factory--image-preloader.js',
  './js/factory--rows.js',
];

gulp.task('build-js', function() {
  gulp.src(jspaths)
    .pipe(concat('app-concat.js'))
    .pipe(closure({angular: true}))
    .pipe(ngannotate())
    .pipe(gulp.dest('./build/js'))
    .pipe(uglify({mangle: false}))
    .pipe(minifyjs())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('./build/js'));

  gulp.src('./js/libraries/flexslider/angular-flexslider.js')
    .pipe(concat('angular-flexslider.js'))
    .pipe(closure({angular: true}))
    .pipe(ngannotate())
    .pipe(gulp.dest('./build/js/libraries/flexslider'))
    .pipe(uglify({mangle: false}))
    .pipe(minifyjs())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('./build/js/libraries/flexslider'));
});

gulp.task('build', ['build-css', 'build-js']);

// Watchers
gulp.task('watch', function() {
  gulp.watch('./css/**/*.css', ['build-css']);
  gulp.watch('./js/**/*.js', ['build-js']);
});

gulp.task('default', ['build-css', 'build-js', 'watch']);
