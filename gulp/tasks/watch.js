var gulp = require('gulp');

gulp.task('watch', ['setWatch', 'browserSync'], function() {
	gulp.watch('themes/**', ['styles']);
	// Note: The browserify task handles js recompiling with watchify
});
