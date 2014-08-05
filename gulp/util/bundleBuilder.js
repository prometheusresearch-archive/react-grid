var gulp         = require('gulp');
var bundleLogger = require('./bundleLogger');
var browserify   = require('browserify');
var handleErrors = require('./handleErrors');
var source       = require('vinyl-source-stream');

function buildBundle(bundleConfig, outFile, outFldr, watch) {
  var bundleMethod = watch && global.isWatching ? watchify : browserify;
  var bundler = bundleMethod(bundleConfig);
  var bundle = function() {
    // Log when bundling starts
    bundleLogger.start();

    return bundler
      .bundle()
      // Report compile errors
      .on('error', handleErrors)
      // Use vinyl-source-stream to make the
      // stream gulp compatible. Specifiy the
      // desired output filename here.
      .pipe(source(outFile))
      // Specify the output destination
      .pipe(gulp.dest(outFldr))
      // Log when bundling completes!
      .on('end', bundleLogger.end);
  };

  if(global.isWatching) {
    // Rebundle with watchify on changes.
    bundler.on('update', bundle);
  }

  return bundle();
}

module.exports = buildBundle;
