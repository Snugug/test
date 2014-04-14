var gulp = require('gulp');
var gitDeploy = require('./git-deploy');
// var debug = require('gulp-debug');

gulp.task('default', function () {
  return gulp.src('build')
    // .pipe(debug({verbose: true}))
    .pipe(gitDeploy());
})