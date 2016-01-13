var gulp = require('gulp');
var git = require('gulp-git');
var filter = require('gulp-filter');
var tag_version = require('gulp-tag-version');
var gulpif = require('gulp-if');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var clean = require('gulp-clean');
var uglify = require('gulp-uglify');
var webserver = require('gulp-webserver');
var bump = require('gulp-bump');
var rename = require('gulp-rename');
var _ = require('underscore');

var development = false;

gulp.task('set-development-mode', function() {
	development = true;
});

gulp.task('develop', ['set-development-mode', 'minify', 'uglify', 'copy-images'], function () {
	gulp.watch(['./js/wysiwyg.js', './css/**/*.sass', './images/**/*'], ['minify', 'uglify', 'copy-images']);
	gulp.src('./dev').pipe(webserver());
});

function getDestination() {
	if (development) {
		return './dev';
	}
	return './dist';
}

function renameMin(path) {
	path.basename += ".min";
	return path;
}

gulp.task('sass', function() {
	return gulp.src('./css/**/*.sass')
		.pipe(sass().on('error', sass.logError))
		.pipe(gulp.dest(getDestination()));
});

gulp.task('minify', ['sass'], function() {
	return gulp.src(getDestination() + '/editor.css')
		.pipe(gulpif(development == false, rename(renameMin)))
		.pipe(minifyCss({compatibility: 'ie8'}))
		.pipe(gulp.dest(getDestination()));
});

gulp.task('clean-css', ['minify'], function () {
	return gulp.src(getDestination() + '/editor.css', {read: false})
		.pipe(clean());
});

gulp.task('uglify', function() {
	return gulp.src('./js/wysiwyg.js')
		.pipe(gulpif(development == false, uglify({ mangle:false })))
		.pipe(gulpif(development == false, rename(renameMin)))
		.pipe(gulp.dest(getDestination()));
});

gulp.task('copy-images', function() {
	return gulp.src('./images/**/*')
		.pipe(gulp.dest(getDestination() + '/images/'));
});

gulp.task('build', ['clean-css', 'uglify', 'copy-images']);

function inc(importance) {
	// get all the files to bump version in
	return gulp.src(['./package.json', './bower.json'])
		// bump the version number in those files
		.pipe(bump({type: importance}))
		// save it back to filesystem
		.pipe(gulp.dest('./'))
		// commit the changed version number
		.pipe(git.commit('bumps package version'))

		// read only one file to get the version number
		.pipe(filter('package.json'))
		// **tag it in the repository**
		.pipe(tag_version());
}

gulp.task('patch', function() { return inc('patch'); });
gulp.task('feature', function() { return inc('minor'); });
gulp.task('release', function() { return inc('major'); });

gulp.task('push', function() {
	var packageJson = require('./package.json');
	git.push('origin', 'v' + packageJson.version, function (err) {
		if (err) throw err;
	});
});