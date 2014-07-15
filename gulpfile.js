var gulp = require('gulp');
var clean = require('gulp-clean');
var open = require('gulp-open');


gulp.task('clean', function() {
  return gulp.src(['build/*'], {read: false}).pipe(clean());
});

var react = require('gulp-react');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var jshint = require('gulp-jshint');
var connect = require('gulp-connect');

// Parse and compress JS and JSX files

gulp.task('javascript',['clean'], function() {
  // Listen to every JS file in ./frontend/javascript
  return gulp.src('lib/**/*.js')
    // Turn React JSX syntax into regular javascript
    .pipe(react())
    // Output each file into the ./build/javascript/ directory
    .pipe(gulp.dest('build/javascript/'))
    // Optimize each JavaScript file
    //.pipe(uglify())
    // Add .min.js to the end of each optimized file
    //.pipe(rename({suffix: '.min'}))
    // Output each optimized .min.js file into the ./build/javascript/ dir
    //.pipe(gulp.dest('build/javascript/'));
});



gulp.task('lint', ['javascript'],function() {
  return gulp.src('./build/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

var browserify = require('gulp-browserify');

gulp.task('browserify', ['javascript', 'lint'], function() {
  return gulp.src('build/javascript/index.js')
    .pipe(browserify({transform: ['envify']}))
    .pipe(rename('compiled.js'))
    .pipe(gulp.dest('build/javascript/'))
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('build/javascript/'));
});


var less = require('gulp-less');
var minifycss = require('gulp-minify-css');

// gulp.task('styles', function() {
//   return gulp.src('themes/**/*.less')
//     .pipe(less())
//     .pipe(gulp.dest('build/'))
//     .pipe(minifycss())
//     .pipe(rename({suffix: '.min'}))
//     .pipe(gulp.dest('build/'));
// });

gulp.task('watch', function() {
  gulp.watch('lib/**/*.js', ['browserify']);

  // Watch for .less file changes and re-run the 'styles' task
  //gulp.watch('frontend/**/*.less', ['styles']);

});


gulp.task('connect', function(done) {
  connect.server({
    livereload : true
  });
  done();
});

gulp.task("launch-example", ['connect', 'browserify'], function(){
  var options = {
    url: "http://localhost:8080/examples/example1.html",
    app: "chrome"
  };
  return gulp.src("./examples/example1.html")
  .pipe(open("", options));
});


gulp.task('launch', ['connect', 'browserify'], function(){
  var options = {
    url: "http://localhost:8080/",
    app: "chrome"
  };
  return gulp.src("./index.html")
  .pipe(open("", options));
});

gulp.task('default',['browserify', 'launch', 'watch'], function() {

});
