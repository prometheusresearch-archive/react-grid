var browserSync = require('browser-sync');
var gulp        = require('gulp');

gulp.task('browserSync', ['build'], function() {
  browserSync({
    server: {
      baseDir: './examples',
      index: "examples.html",
      routes: {
        "/bower_components": "./bower_components",
      }
    }
  });
});
