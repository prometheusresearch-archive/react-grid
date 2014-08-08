var gulp = require("gulp");
var less = require("gulp-less");

// task
gulp.task('styles', ['clean'], function () {
    return gulp.src('./examples/examples.less')
    .pipe(less())
    //compile into our examples folder
    .pipe(gulp.dest('./examples/build'));
});
