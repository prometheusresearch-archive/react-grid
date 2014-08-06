var gulp = require('gulp');
var jasmine = require('gulp-jasmine');
//var flatten = require('gulp-flatten');
var concat = require('gulp-concat');
var buildBundle = require('../util/bundleBuilder');
gulp.task('tests-concat', function () {
  return gulp.src([
  //   'node_modules/es5-shim/es5-shim.js',
  // 'node_modules/es5-shim/es5-sham.js',
  'node_modules/es6-shim/es6-shim.js',
  'test/**/*.spec.js'])
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
gulp.task('tests-launch', ['tests-build'],function () {
  browserSync({
    server: {
      baseDir: './test',
      index: "testRunner.html",
      routes: {
        "/bower_components": "./bower_components",
        "/node_modules": "./node_modules"
      }

    }
  });
});
