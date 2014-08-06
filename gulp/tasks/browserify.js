/* browserify task
   ---------------
   Bundle javascripty things with browserify!

   If the watch task is running, this uses watchify instead
   of browserify for faster bundling using caching.
*/

var buildBundle = require('../util/bundleBuilder');
var gulp        = require('gulp');
var concat			= require('gulp-concat');

gulp.task('script-deps',function() {
	return gulp.src([
		'node_modules/es5-shim/es5-shim.js',
		'node_modules/es5-shim/es5-sham.js',
		'node_modules/es6-shim/es6-shim.js',
		'bower_components/jasmine/lib/jasmine-core/jasmine.js',
		'bower_components/jasmine/lib/jasmine-core/jasmine-html.js',
		'bower_components/jasmine/lib/jasmine-core/boot/boot.js',
	])
	.pipe(concat('lib.js'))
	.pipe(gulp.dest('./examples/build'))
});
gulp.task('browserify',['script-deps'], function() {
	var bundleConfig = {
		// Specify the entry point of your app
		entries: ['./examples/index.js'],
		// Add file extentions to make optional in your requires
		extensions: [],
		// Enable source maps!
		debug: true
	};
	return buildBundle(bundleConfig, 'app.js', './examples/build/');

});
