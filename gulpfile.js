var gulp = require('gulp');
var clean = require('gulp-clean');


gulp.task('clean', function() {
  return gulp
    .src(['build/*','dist/*'], {read: false})
    .pipe(clean({force: true}));
});

var plumber = require('gulp-plumber');
var react = require('gulp-react');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

gulp.task('javascript',['clean'], function() {

  return gulp.src(['lib/*.js'])
  //.pipe(plumber())
    // Turn React JSX syntax into regular javascript
    .pipe(react({harmony:false}))
    // Output each file into the ./build/javascript/ directory
    .pipe(gulp.dest('build/js/'));
});



var jshint = require('gulp-jshint');
function lint(src) {
  return gulp.src(src)
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
}
gulp.task('lint', ['javascript'],function() {
  return lint(['build/**/*.js']);
});

var browserify = require('gulp-browserify');

gulp.task('browserify', ['javascript', 'lint'], function() {


   return gulp.src('build/js/index.js')
     .pipe(plumber())
    .pipe(browserify({transform: ['envify']}))
    .pipe(rename('react-grid.js'))
    .pipe(gulp.dest('dist/js/'))
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('dist/js/'));


});

gulp.task('examples',['browserify'], function() {

     //process examples
    return gulp.src('examples/jsx/*.jsx')
    .pipe(plumber())
    .pipe(browserify({transform: ['envify','reactify']}))
    .pipe(gulp.dest('build/js/examples/'));


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
  gulp.watch(['lib/**/*.js','examples/**/*.jsx'], ['browserify','examples']);

  // Watch for .less file changes and re-run the 'styles' task
  //gulp.watch('frontend/**/*.less', ['styles']);

});


var connect = require('gulp-connect');
gulp.task('connect', function(done) {
  connect.server({
    livereload : true
  });
  done();
});

var open = require('gulp-open');
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

gulp.task('default',['browserify','examples', 'launch', 'watch'], function() {

});
