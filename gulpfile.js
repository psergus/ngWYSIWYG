var gulp = require('gulp');
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

gulp.task('dist', ['build'], function() {
	var bumpType = process.argv[3];
	if (!bumpType){
		throw 'What bump type do you want? Major, minor or patch?'
	}
	// lower case and avoid -- at the begining
	bumpType = bumpType.toLowerCase().substring(2, bumpType.length);
	if (!_.contains(['major', 'minor', 'patch'], bumpType)) {
		throw 'What bump type do you want? Major, minor or patch?'
	}
	gulp.src(['./bower.json', './component.json', './package.json'])
		.pipe(bump({type: bumpType}))
		.pipe(gulp.dest('./'));
});