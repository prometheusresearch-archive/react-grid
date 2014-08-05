var gulp = require('gulp');
var jasmine = require('gulp-jasmine');
var flatten = require('gulp-flatten');
var concat = require('gulp-concat');
var buildBundle = require('../util/bundleBuilder');
gulp.task('tests-concat', function () {
  return gulp.src('test/**/*.spec.js')
    .pipe(flatten())
    .pipe(concat('specs.js'))
    .pipe(gulp.dest('test/build'));
});

gulp.task('tests-build', ['tests-concat'], function () {

    var bundleConfig = {
      entries: ['./test/build/specs.js']
    };
    return buildBundle(bundleConfig, 'specs-all.js', 'test/build');
});

gulp.task('tests-run',function () {
    return gulp.src('build/test/core/*.js').pipe(jasmine());
});

var browserSync = require('browser-sync');
gulp.task('tests', ['tests-build'],function () {
  browserSync({
    server: {
      baseDir: './test',
      index: "testRunner.html",

    }
  });
});
