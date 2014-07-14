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

gulp.task('javascript', function() {
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

gulp.task('compile-examples', function() {
  return gulp.src('examples/jsx/*.jsx')
    .pipe(browserify({transform: ['envify']}))
    .pipe(react())
    .pipe(gulp.dest('examples/build/'))
});

gulp.task('connect', ['compile-examples'], function() {
  connect.server({
    livereload : true
  });
});

gulp.task("example", ['connect'], function(){
  var options = {
    url: "http://localhost:8080/examples/example1.html",
    app: "chrome"
  };
  gulp.src("./examples/example1.html")
  .pipe(open("", options));
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

gulp.task('lint', function() {
  return gulp.src('./build/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
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
var nodemon = require('gulp-nodemon');

gulp.task('watch', ['clean'], function() {
  var watching = false;
  gulp.start('browserify', 'styles', function() {
    // Protect against this function being called twice. (Bug?)
    if (!watching) {
      watching = true;

      // Watch for changes in frontend js and run the 'javascript' task
      gulp.watch('lib/**/*.js', ['javascript','browserify_nodep']);

      // // Run the 'browserify_nodep' task when client.js changes
      // gulp.watch('build/javascript/compiled.js', ['browserify_nodep']);

      // Watch for .less file changes and re-run the 'styles' task
      //gulp.watch('frontend/**/*.less', ['styles']);

      // Start up the server and have it reload when anything in the
      // ./build/ directory changes
      //nodemon({script: 'server.js', watch: 'build'});
    }
  });
});

gulp.task('default', ['clean'], function() {
  return gulp.start('browserify'
  	//, 'styles'
  	);
});
