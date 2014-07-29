var gulp = require('gulp');
var debug = require('gulp-debug');
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

gulp.task('js-build',['clean'], function() {

  return gulp.src(['lib/*.js'])
    .pipe(plumber())
    // Turn React JSX syntax into regular js-build
    .pipe(react({harmony:false}))
    // Output each file into the ./build/js-build/ directory
    .pipe(gulp.dest('build/js/'));
});



var jshint = require('gulp-jshint');
function lint(src) {
  return gulp.src(src)
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
}
gulp.task('js-lint', ['js-build'],function() {
  return lint(['build/**/*.js']);
});

var browserify = require('gulp-browserify');

gulp.task('js-combine', ['js-build', 'js-lint'], function() {


   return gulp.src('build/js/index.js')
     .pipe(plumber())
    .pipe(browserify({transform: ['envify']}))
    .pipe(rename('react-grid.js'))
    .pipe(gulp.dest('dist/js/'))
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('dist/js/'));


});

gulp.task('examples',['js-build'], function() {

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
  return gulp.watch(['lib/**/*.js','examples/**/*.jsx'], ['js-combine','examples']);

  // Watch for .less file changes and re-run the 'styles' task
  //gulp.watch('frontend/**/*.less', ['styles']);

});


var connect = require('gulp-connect');
gulp.task('connect', function() {
  return connect.server({
    livereload : true
  });
});

var open = require('gulp-open');
gulp.task("launch-example", ['connect', 'js-combine'], function(){
  var options = {
    url: "http://localhost:8080/examples/example1.html",
    app: "chrome"
  };
  return gulp.src("examples/example1.html")
  .pipe(open("", options));
});

var launchPage = function(page) {
  page = page || "index.html";
  var options = {
    url: "http://localhost:8080/" + page,
    app: "chrome"
  };
  return gulp.src(page)
  .pipe(open("", options));

};
gulp.task('launch', ['connect', 'js-combine'], function(){
  return launchPage();
});

gulp.task('tests-clean', function () {
  return
  gulp.src('build/test', {read: false})
  .pipe(clean({force: true}))
});

var jasmine = require('gulp-jasmine');
var concat = require('gulp-concat');
var addsrc = require('gulp-add-src');
var flatten = require('gulp-flatten');
gulp.task('tests-1', function () {


  return gulp.src('test/**/*.js')
    .pipe(plumber())
    .pipe(rename({suffix:'.spec'}))
    .pipe(flatten())
    .pipe(addsrc(['lib/*.js']))
    .pipe(gulp.dest('build/test/temp'))

});

gulp.task('tests-build',['tests-1'], function () {
  return gulp.src(['build/test/temp/*.spec.js'])
    .pipe(browserify({transform: ['reactify']}))
    .pipe(rename("specs-all.js"))
    .pipe(gulp.dest('build/test'));

});

gulp.task('tests', ['tests-clean','tests-build'],function () {
    return gulp.src('build/test/core/*.js').pipe(jasmine());
});


gulp.task('tests-run', ['tests','connect'],function () {
    return launchPage("./test/testRunner.html")
    .pipe(gulp.watch(['lib/**/*.js','examples/**/*.jsx','test/**/*.js'], ['tests']));
;;
});

gulp.task('default',['js-combine','examples', 'launch', 'watch'], function() {

});
