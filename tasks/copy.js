const gulp = require('gulp');

module.exports = function({
    src,
    dst,
}) {
    return gulp.src(src)
        .pipe(gulp.dest(dst));
};