var es6 = require('es6-shim');
var gulp = require('gulp');
var karma = require('karma').server;
var merge = require('../../lib/merge');


//one could also externalize common config into a separate file,
//ex.: var karmaCommonConf = require('./karma-common-conf.js');
var karmaCommonConf = {
  browsers: ['Chrome'],
  frameworks: ['jasmine'],
  files: [
      'test/build/specs-all.js'
  ]
};

/**
 * Run test once and exit
 */
gulp.task('tests',['tests-build'], function (done) {
  var conf = merge({autoWatch: false, singleRun: true}, karmaCommonConf);
  karma.start(conf, done);
});

/**
 * Watch for file changes and re-run tests on each change
 * ---NOT WORKING----
 * Currently its only looking for test files changing
 * Need to plugin in browserify if we want to watch all our files
 * means it will only reload if you change the main entry file (ie run gulp tests-build)
 */
gulp.task('tdd', function (done) {
  var conf = merge({autoWatch: true, singleRun: false}, karmaCommonConf);
  karma.start(karmaCommonConf, done);
});
