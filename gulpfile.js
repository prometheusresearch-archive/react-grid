/*
	gulpfile.js
	===========
	Rather than manage one giant configuration file responsible
	for creating multiple tasks, each task has been broken out into
	its own file in gulp/tasks. Any file in that folder gets automatically
	required by the loop in ./gulp/index.js (required below).

	To add a new task, simply add a new task file to gulp/tasks.
*/

require('./gulp');

// var gulp = require('gulp');
// var clean = require('gulp-clean');
// var rename = require('gulp-rename');
//
//
// gulp.task('clean', function() {
//   return gulp
//     .src(['dist','**/build'], {read: false})
//     .pipe(clean({force: true}));
// });
//
// gulp.task('browserify', ['clean'], function() {
//   return buildBundle('./lib/index.js', 'react-grid.js', 'dist/js/');
// });
//
// gulp.task('examples-build', ['clean'], function() {
//   return buildBundle('./examples/index.js', 'app.js', 'examples/build/');
// });
//
//
// var source = require('vinyl-source-stream');
// var browserify = require('browserify');
// //the core bundle for our application
// var buildBundle = function(src, dest, destFolder) {
//   return browserify(src)
//      .bundle()
//      .pipe(source(dest))
//      .pipe(gulp.dest(destFolder));
// }
//
//
// var launchPage = function(page) {
//   page = page || "index.html";
//   var options = {
//     url: "http://localhost:8080/" + page,
//     app: "chrome"
//   };
//   return gulp.src(page)
//   .pipe(open("", options));
//
// };
//
//
// var connect = require('gulp-connect');
// gulp.task('connect', function() {
//   return connect.server({
//     livereload : true
//   });
// });
//
// var open = require('gulp-open');
// gulp.task("examples-launch", ['connect', 'examples-build', 'styles'], function(){
//   var options = {
//     url: "http://localhost:8080/examples/examples.html",
//     app: "chrome"
//   };
//   return gulp.src("examples/examples.html")
//   .pipe(open("", options));
// });
//
//
// less = require("gulp-less");
//
// // task
// gulp.task('styles',['clean'], function () {
//     return processLess(gulp.src('./themes/bootstrap.less'));
//
// });
// function processLess(files) {
//   return files.pipe(less())
//   .pipe(gulp.dest('./themes/build'));
// }
// gulp.task('watch', ['styles','examples-build'], function() {
//   return gulp.watch(['lib/*.js','examples/*.js', 'themes/*.less'],['examples-build'])
//
// });
// gulp.task('default', ['watch','examples-launch']);
